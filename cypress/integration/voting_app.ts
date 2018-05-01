describe('Voting App', () => {
  describe('/test', () => {
    it('should assert that /test is working', () => {
      cy.request('/test').then(response => {
        expect(response.body).to.have.property('message', 'Hello World!');
      });
    });
  });

  describe('/', () => {
    beforeEach(() => {
      cy.exec('npm run db:reset');
    });

    it('should assert that <title> is correct', () => {
      cy.visit('/');
      cy.title().should('include', 'Voting App');
    });

    it('should assert that <nav> is correct when logged out', () => {
      cy.visit('/');

      cy.get('nav').within(() => {
        cy.get('.navbar-brand').should('be.visible');
        cy.get('.button').should('be.visible');
        cy.contains('Home').should('have.attr', 'href', '/');
        cy.contains('Register').should('have.attr', 'href', '/register');
        cy.contains('Login').should('have.attr', 'href', '/login');
      });
    });

    it('should assert that <nav> is correct when logged in', () => {
      cy.exec('npm run db:seed');

      cy.visit('/login');
      cy.get('input[name=email]').type(Cypress.env('email'));
      cy.get('input[name=password]').type(`${Cypress.env('password')}{enter}`);

      cy.get('nav').within(() => {
        cy.get('.navbar-brand').should('be.visible');
        cy.get('.button').should('be.visible');
        cy.contains('Home').should('have.attr', 'href', '/');
        cy.contains('Profile').should('have.attr', 'href', '/profile');
        cy.get('form').within(() => {
          cy.get('_csrf').should('not.be.visible');
          cy.get('button').should('have.text', 'Logout');
        });
      });
    });

    it('should show flash after logging out', () => {
      cy.exec('npm run db:seed');

      cy.visit('/login');
      cy.get('input[name=email]').type(Cypress.env('email'));
      cy.get('input[name=password]').type(`${Cypress.env('password')}{enter}`);

      cy.get('.hero').within(() => {
        cy.get('.message').should('contain', 'You are now logged in!');
      });

      cy.contains('Logout').click();

      cy.get('.hero').within(() => {
        cy.get('.message').should('contain', 'You are now logged out!');
      });
    });

    it('should assert that flash messages are functional', () => {
      cy.exec('npm run db:seed');

      cy.visit('/login');
      cy.get('input[name=email]').type(Cypress.env('email'));
      cy.get('input[name=password]').type(`${Cypress.env('password')}{enter}`);

      cy
        .get('.message')
        .should('be.visible')
        .within($message => {
          expect($message).to.contain('Success');
          expect($message).to.contain('You are now logged in!');
        });

      cy.get('.delete').click();
      cy.get('.message').should('not.be.visible');
    });
  });

  describe('/login', () => {
    beforeEach(() => {
      cy.exec('npm run db:reset');
      cy.visit('/login');
    });

    it('should have proper /login <form>', () => {
      cy.title().should('include', 'Login');
      cy.get('form').within(() => {
        cy.get('input').should('have.length', 4);
        cy
          .get('input:first')
          .should('not.be.visible')
          .and($input => {
            expect($input.attr('name')).to.equal('_csrf');
            expect($input.val()).to.be.a('string');
          });
        cy.contains('Register').should('have.attr', 'href', '/register');
      });
    });

    it('should be able to login on /login', () => {
      cy.exec('npm run db:seed');

      cy.get('input[name=email]').type(Cypress.env('email'));
      cy.get('input[name=password]').type(`${Cypress.env('password')}{enter}`);
      cy
        .get('.message')
        .should('be.visible')
        .within($message => {
          expect($message).to.contain('Success');
          expect($message).to.contain('You are now logged in!');
        });

      cy.get('nav').within(() => {
        cy.get('[href="/profile"]').should('be.visible');
        cy.get('.button').should('contain', 'Logout');
      });
    });

    it('should not be able to login on /login with unregistered user', () => {
      cy.get('input[name=email]').type(Cypress.env('wrongEmail'));
      cy.get('input[name=password]').type(`${Cypress.env('wrongPassword')}{enter}`);
      cy
        .get('.message')
        .should('be.visible')
        .within($message => {
          expect($message).to.contain('Error');
          expect($message).to.contain('Failed Login!');
        });

      cy.get('input[name=email]').should('be.empty');
      cy.get('input[name=password]').should('be.empty');
    });

    it('should not be able to login on /login with registered user and wrong password', () => {
      cy.exec('npm run db:seed');

      cy.get('input[name=email]').type(Cypress.env('email'));
      cy.get('input[name=password]').type(`${Cypress.env('wrongPassword')}{enter}`);
      cy
        .get('.message')
        .should('be.visible')
        .within($message => {
          expect($message).to.contain('Error');
          expect($message).to.contain('Failed Login!');
        });

      cy.get('input[name=email]').should('be.empty');
      cy.get('input[name=password]').should('be.empty');
    });
  });

  describe('/register', () => {
    beforeEach(() => {
      cy.exec('npm run db:reset');
      cy.visit('/register');
    });

    it('should have proper /register <form>', () => {
      cy.title().should('include', 'Register');
      cy.get('form').within(() => {
        cy.get('input').should('have.length', 7);
        cy.get('input:first').should($input => {
          expect($input.attr('name')).to.equal('_csrf');
          expect($input.val()).to.be.a('string');
        });
      });
    });

    it('should be able to register on /register', () => {
      cy.get('input[name=name]').type(Cypress.env('name'));
      cy.get('input[name=email]').type(Cypress.env('email'));
      cy.get('input[name=password]').type(`${Cypress.env('password')}`);
      cy
        .get('input[name=passwordRepeat]')
        .type(`${Cypress.env('passwordRepeat')}{enter}`);

      cy
        .get('.message')
        .should('be.visible')
        .within($message => {
          expect($message).to.contain('Success');
          expect($message).to.contain('You are now logged in!');
        });

      cy.get('nav').within(() => {
        cy.get('[href="/profile"]').should('be.visible');
        cy.get('.button').should('contain', 'Logout');
      });
    });

    it('should not be able to register on /register with wrong name', () => {
      cy.get('input[name=name]').type(Cypress.env('wrongName'));
      cy.get('input[name=email]').type(Cypress.env('email'));
      cy.get('input[name=password]').type(`${Cypress.env('password')}`);
      cy
        .get('input[name=passwordRepeat]')
        .type(`${Cypress.env('passwordRepeat')}{enter}`);

      cy
        .get('.message')
        .should('be.visible')
        .within($message => {
          expect($message).to.contain('Error');
          expect($message).to.contain(
            'Please enter only unaccented alphabetical letters, A–Z or a–z',
          );
        });

      cy.get('form').within($form => {
        expect($form.find('.help')).to.contain(
          'Please enter only unaccented alphabetical letters, A–Z or a–z',
        );
        expect($form.find('[name="name"]')).to.have.class('is-danger');
        expect($form.find('[name="email"]')).to.have.class('is-success');
      });

      cy.get('nav').within(() => {
        cy.get('[href="/profile"]').should('not.be.visible');
        cy.get('.button').should('contain', 'Login');
      });
    });

    it('should not be able to register on /register with wrong email', () => {
      cy.get('input[name=name]').type(Cypress.env('name'));
      cy.get('input[name=email]').type(Cypress.env('wrongEmail'));
      cy.get('input[name=password]').type(`${Cypress.env('password')}`);
      cy
        .get('input[name=passwordRepeat]')
        .type(`${Cypress.env('passwordRepeat')}{enter}`);

      cy
        .get('.message')
        .should('be.visible')
        .within($message => {
          expect($message).to.contain('Error');
          expect($message).to.contain('Must be a correct email');
        });

      cy.get('form').within($form => {
        expect($form.find('.help')).to.contain('Must be a correct email');
        expect($form.find('[name="name"]')).to.have.class('is-success');
        expect($form.find('[name="email"]')).to.have.class('is-danger');
      });

      cy.get('nav').within(() => {
        cy.get('[href="/profile"]').should('not.be.visible');
        cy.get('.button').should('contain', 'Login');
      });
    });

    it('should not be able to register on /register with not matching passwords', () => {
      cy.get('input[name=name]').type(Cypress.env('name'));
      cy.get('input[name=email]').type(Cypress.env('email'));
      cy.get('input[name=password]').type(`${Cypress.env('wrongPassword')}`);
      cy
        .get('input[name=passwordRepeat]')
        .type(`${Cypress.env('passwordRepeat')}{enter}`);

      cy
        .get('.message')
        .should('be.visible')
        .within($message => {
          expect($message).to.contain('Error');
          expect($message).to.contain('Passwords do not match');
        });

      cy.get('form').within($form => {
        expect($form.find('.help')).to.contain('Passwords do not match');
        expect($form.find('[name="name"]')).to.have.class('is-success');
        expect($form.find('[name="email"]')).to.have.class('is-success');
        expect($form.find('[name="password"]')).to.have.class('is-danger');
        expect($form.find('[name="passwordRepeat"]')).to.have.class('is-danger');
      });

      cy.get('nav').within(() => {
        cy.get('[href="/profile"]').should('not.be.visible');
        cy.get('.button').should('contain', 'Login');
      });
    });

    it('should not be able to register on /register with incorrect password', () => {
      cy.get('input[name=name]').type(Cypress.env('name'));
      cy.get('input[name=email]').type(Cypress.env('email'));
      cy.get('input[name=password]').type(`${Cypress.env('wrongPassword')}`);
      cy
        .get('input[name=passwordRepeat]')
        .type(`${Cypress.env('wrongPassword')}{enter}`);

      cy
        .get('.message')
        .should('be.visible')
        .within($message => {
          expect($message).to.contain('Error');
          expect($message).to.contain(
            'Password must be at least 5 characters long and contain one number',
          );
        });

      cy.get('form').within($form => {
        expect($form.find('.help')).to.contain(
          'Password must be at least 5 characters long and contain one number',
        );
        expect($form.find('[name="name"]')).to.have.class('is-success');
        expect($form.find('[name="email"]')).to.have.class('is-success');
        expect($form.find('[name="password"]')).to.have.class('is-danger');
        expect($form.find('[name="passwordRepeat"]')).to.have.class('is-danger');
      });

      cy.get('nav').within(() => {
        cy.get('[href="/profile"]').should('not.be.visible');
        cy.get('.button').should('contain', 'Login');
      });
    });
  });

  describe('/profile', () => {
    beforeEach('should have correct update form', () => {
      cy.exec('npm run db:reset');
      cy.exec('npm run db:seed');
      cy.visit('/login');

      cy.get('input[name="_csrf"]').then($input => {
        const csrfToken = $input.attr('value');
        cy
          .request('POST', '/login', {
            email: Cypress.env('email'),
            password: Cypress.env('password'),
            _csrf: csrfToken,
          })
          .then(() => {
            cy.visit('/profile');
          });
      });
    });

    it('should contain correct profile form', () => {
      cy.title().should('include', 'Profile');
      cy.get('main form').within(() => {
        cy.get('input').should('have.length', 7);
        cy.get('input[name="email"]').should('have.attr', 'disabled');
        cy.get('input:first').should($input => {
          expect($input.attr('name')).to.equal('_csrf');
          expect($input.val()).not.to.eq('');
        });
      });
    });

    it('should change name on profile update', () => {
      cy.get('input[name="name"]').type(' new{enter}');

      cy.get('input[name="name"]').should('have.value', `${Cypress.env('name')} new`);
      cy.get('.message').should('contain', 'Name successfully changed');
    });

    it('should not change name on profile update with incorrect input', () => {
      cy.get('input[name="name"]').type(' new@{enter}');

      cy.get('input[name="name"]').should('be.empty');
      cy
        .get('.message')
        .should(
          'contain',
          'Please enter only unaccented alphabetical letters, A–Z or a–z',
        );
    });

    describe('/profile/delete', () => {
      it('should delete the user', () => {
        cy.get('input[name="delete"]').click();
        cy.get('.message').should('contain', 'Your account has been deleted');
        cy.url().should('contain', '/');

        cy.visit('/login');

        cy.get('input[name="_csrf"]').then($input => {
          const csrfToken = $input.attr('value');
          cy
            .request('POST', '/login', {
              email: Cypress.env('email'),
              password: Cypress.env('password'),
              _csrf: csrfToken,
            })
            .then(() => {
              cy.visit('/profile');
              cy.get('.message').should('contain', 'You must be logged in to do that');
            });
        });
      });
    });

    describe('/profile/password', () => {
      beforeEach('should have correct update form', () => {
        cy.visit('/profile/password');
      });

      it('should change password on new password profile update', () => {
        cy.visit('/profile/password');

        const newPassword = `${Cypress.env('password')}new`;
        cy.get('input[name="passwordOld"]').type(Cypress.env('password'));
        cy.get('input[name="passwordNew"]').type(newPassword);
        cy
          .get('input[name="passwordRepeat"]')
          .type(`${Cypress.env('password')}new{enter}`);
        cy.get('.message').should('contain', 'Password successfully changed');

        cy
          .contains('Logout')
          .siblings('[name="_csrf"]')
          .then($input => {
            const logoutCsrfToken = $input.attr('value');

            cy.request('POST', '/logout', { _csrf: logoutCsrfToken }).then(() => {
              cy.visit('/login');

              cy.get('input[name="_csrf"]').then($input => {
                const loginCsrfToken = $input.attr('value');
                cy
                  .request('POST', '/login', {
                    email: Cypress.env('email'),
                    password: newPassword,
                    _csrf: loginCsrfToken,
                  })
                  .then(() => {
                    cy.visit('/');
                    cy.contains('Logout');
                  });
              });
            });
          });
      });

      it('should not change password on with incorrect old password', () => {
        cy.visit('/profile/password');

        cy.get('input[name="passwordOld"]').type('Nope123');
        cy.get('input[name="passwordNew"]').type(`${Cypress.env('password')}new`);
        cy
          .get('input[name="passwordRepeat"]')
          .type(`${Cypress.env('password')}new{enter}`);

        cy.get('.message').should('contain', 'Entered old password is incorrect');
      });

      it('should not change password on with incorrect new password', () => {
        cy.visit('/profile/password');

        cy.get('input[name="passwordOld"]').type(Cypress.env('password'));
        cy.get('input[name="passwordNew"]').type('nope');
        cy.get('input[name="passwordRepeat"]').type('nope{enter}');

        cy
          .get('.message')
          .should(
            'contain',
            'Password must be at least 5 characters long and contain one number',
          );
      });

      it('should not change password on with incorrect repeat password', () => {
        cy.visit('/profile/password');

        cy.get('input[name="passwordOld"]').type(Cypress.env('password'));
        cy.get('input[name="passwordNew"]').type('nope123');
        cy.get('input[name="passwordRepeat"]').type('nope12{enter}');

        cy.get('.message').should('contain', 'Passwords do not match');
      });
    });
  });

  describe('/poll', () => {
    beforeEach('should have correct update form', () => {
      cy.exec('npm run db:reset');
      cy.exec('npm run db:seed');
      cy.visit('/login');

      cy.get('input[name="_csrf"]').then($input => {
        const csrfToken = $input.attr('value');
        cy.request('POST', '/login', {
          email: Cypress.env('email'),
          password: Cypress.env('password'),
          _csrf: csrfToken,
        });
      });
    });

    describe('/poll/all', () => {
      beforeEach(() => {
        cy.visit('/poll/all');
      });

      it('should show all polls', () => {
        cy.get('body');
      });
    });

    describe('/poll/vote', () => {
      const option = 'BC';

      beforeEach(() => {
        cy.visit('/poll/new');
        cy.get('input[name="pollName"]').type("Anton's poll");
        cy.get('textarea[name="pollOptions"]').type(`AB\n${option}\nCD`);
        cy.contains('Create').click();
      });

      it('should show a poll by an id', () => {
        cy.get('.message').should('contain', 'Poll submitted');
        cy.contains('View poll').click();
      });

      it('should cast a vote on a poll', () => {
        cy.get('.message').should('contain', 'Poll submitted');
        cy.contains('View poll').click();

        cy.get('select').select(option);
        cy.contains('Vote').click();
      });
    });

    describe('/poll/new', () => {
      beforeEach(() => {
        cy.visit('/poll/new');
      });

      it('should register a new poll', () => {
        cy.get('input[name="pollName"]').type("Anton's poll");
        cy.get('textarea[name="pollOptions"]').type('AB\nBC\nCD');
        cy.contains('Create').click();

        cy.get('.message').should('contain', 'Poll submitted');
      });
    });
  });
});
