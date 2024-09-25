import { render, screen } from '@testing-library/react';
import App from './App';

test('renders hello message', async () => {
  render(<App />);
  const linkElement = await screen.findByRole('heading', { name: /Hello World!/i });
  expect(linkElement).toBeInTheDocument();
});

