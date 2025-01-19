import { render, screen } from '@testing-library/react';
import App from './App';
import { act } from 'react';

jest.mock('axios', () => ({
  get: jest.fn(),
}));

test('renders login page', async () => {
  await act(async () => {
    render(<App />);
  });
  const headingElement = await screen.findByRole('heading', { name: /ログイン/i });
  expect(headingElement).toBeInTheDocument();
});

test('renders login inputs and buttons', async () => {
  render(<App />);
  
  // Username入力欄を確認
  const usernameInput = await screen.findByPlaceholderText(/Username/i);
  expect(usernameInput).toBeInTheDocument();

  // Password入力欄を確認
  const passwordInput = await screen.findByPlaceholderText(/Password/i);
  expect(passwordInput).toBeInTheDocument();

  // ログインボタンを確認
  const loginButton = await screen.findByRole('button', { name: /ログイン/i });
  expect(loginButton).toBeInTheDocument();
});
