import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user', async () => {
    });

    it('should throw error if email already exists', async () => {
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
    });

    it('should throw error with invalid credentials', async () => {
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
    });
  });
});
