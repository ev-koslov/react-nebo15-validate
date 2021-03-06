import validate from '../src/validate';
import arrayOf from '../src/arrayOf';
import collectionOf from '../src/collectionOf';

describe('validate', () => {
  const value = {
    first_name: 'Ivan',
    birth_date: new Date(2017, 2, 23),
  };
  const schema = {
    first_name: {
      required: true,
      minLength: 4,
      string: true,
    },
    last_name: {
      required: true,
      minLength: 4,
      string: true,
    },
    birth_date: {
      required: true,
      maxDate: new Date(2016, 2, 23),
    },
  };

  it('should return validation object', () => {
    expect(validate(value, schema)).to.deep.equal({
      last_name: {
        error: {
          required: true,
          minLength: 4,
          string: true,
        },
        schema: {
          required: true,
          minLength: 4,
          string: true,
        }
      },
      birth_date: {
        error: {
          maxDate: schema.birth_date.maxDate,
        },
        schema: {
          maxDate: schema.birth_date.maxDate,
          required: true,
        },
      },
    });
  });
  it('should return empty object for valid value', () => {
    expect(validate({
      first_name: 'Ivan',
      last_name: 'Ivanov',
      birth_date: new Date(1980, 2, 23),
    }, schema)).to.deep.equal({});
  });

  describe('arrayOf', () => {
    const tagSchema = {
      required: true,
      minLength: 4,
    };
    const schema = {
      tags: arrayOf(tagSchema),
    };

    it('should validate array by schema', () => {
      expect(validate({
        tags: ['new', 'news', 'other']
      }, schema)).to.deep.equal({
        'tags[0]': {
          error: {
            minLength: 4,
          },
          schema: tagSchema,
        },
      });
    });
    it('should return empty object on valid value', () => {
      expect(validate({
        tags: ['news', 'news', 'other']
      }, schema)).to.deep.equal({});
    });
    describe('options', () => {
      it('should return and error for the root object', () => {
        const contactSchema = {
          required: true,
        };
        const schema = {
          contacts: arrayOf(contactSchema, {
            minLength: 1,
          }),
        };
        expect(validate({
          contacts: [],
        }, schema)).to.deep.equal({
          contacts: {
            error: {
              minLength: 1,
            },
            schema: {
              minLength: 1,
            },
            isArray: true,
          },
        });
      });
    });
  });

  describe('collectionOf', () => {
    const contactSchema = {
      first_name: {
        required: true,
        minLength: 4,
      },
      last_name: {
        required: true,
        minLength: 4,
      },
      second_name: {
        minLength: 4,
      }
    };
    const schema = {
      contacts: collectionOf(contactSchema),
    };

    it('should validate collection by schema', () => {
      expect(validate({
        contacts: [
          {
            first_name: 'Ivan',
            last_name: 'Ivanov',
          },
          {
            first_name: 'Petr',
            last_name: 'Petro',
            second_name: 'Pe',
          },
        ],
      }, schema)).to.deep.equal({
        'contacts[0].second_name': {
          error: {
            minLength: 4,
          },
          schema: {
            minLength: 4,
          },
        },
        'contacts[1].second_name': {
          error: {
            minLength: 4,
          },
          schema: {
            minLength: 4,
          },
        },
      });
    });
    it('should return empty object on valid value', () => {
      expect(validate({
        contacts: [
          {
            first_name: 'Ivan',
            last_name: 'Ivanov',
          },
          {
            first_name: 'Petr',
            last_name: 'Petro',
            second_name: 'Petrovich',
          },
        ],
      }, schema)).to.deep.equal({
        'contacts[0].second_name': {
          error: {
            minLength: 4,
          },
          schema: {
            minLength: 4,
          }
        },
      });
    });

    describe('options', () => {
      it('should return en error for a collection root object', () => {
        const schema = {
          contacts: collectionOf({}, {
            required: true,
          }),
        };
        expect(validate({
          contacts: null,
        }, schema)).to.deep.equal({
          contacts: {
            error: {
              required: true,
            },
            schema: {
              required: true,
            },
            isArray: true,
          },
        });
      });
      it('should return an error for a collection root object', () => {
        const schema = {
          contacts: collectionOf({
            first_name: {
              required: true,
              minLength: 4,
            },
          }, {
            minLength: 1,
          }),
        };
        expect(validate({
          contacts: [],
        }, schema)).to.deep.equal({
          contacts: {
            error: {
              minLength: 1,
            },
            schema: {
              minLength: 1,
            },
            isArray: true,
          },
        });
      });
    });
  });
  describe('function as param', () => {
    it('should get in arguments hole object values', () => {
      expect(validate({
        type: 'car',
      }, {
        model: {
          required: (props, value, values) => values.type === 'car',
        },
      })).to.deep.equal({
        model: {
          error: {
            required: true,
          },
          schema: {
            required: true,
          },
        },
      });
    });
  });
});
