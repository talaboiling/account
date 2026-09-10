import { render, screen } from '@testing-library/react';
import App from './App';

test('unauthenticated user is redirected to the login page', () => {
  render(<App />);
  expect(screen.getByText(/Вход в систему/i)).toBeInTheDocument();
});
