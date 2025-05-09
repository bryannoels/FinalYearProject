import { render, screen, fireEvent } from '@testing-library/react';
import Dropdown from './Dropdown';
import '@testing-library/jest-dom';

describe('Dropdown Component', () => {
  const defaultProps = {
    suggestions: [
      { ticker: 'AAPL', name: 'Apple Inc.' },
      { ticker: 'GOOG', name: 'Google LLC' }
    ],
    dropdownRef: { current: null },
    onItemClick: jest.fn(),
    isOpen: true
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with suggestions', () => {
    render(<Dropdown {...defaultProps} />);

    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('GOOG')).toBeInTheDocument();
    expect(screen.getByText('Google LLC')).toBeInTheDocument();
  });

  it('renders "Not Found" when there are no suggestions', () => {
    render(<Dropdown {...defaultProps} suggestions={[]} />);
    expect(screen.getByText('Not Found')).toBeInTheDocument();
  });

  it('calls onItemClick with correct args when an item is clicked (no portfolio)', () => {
    render(<Dropdown {...defaultProps} />);
    fireEvent.click(screen.getByText('AAPL'));

    expect(defaultProps.onItemClick).toHaveBeenCalledWith('AAPL');
  });

  it('calls onItemClick with portfolio name when provided', () => {
    const propsWithPortfolio = {
      ...defaultProps,
      portfolioName: 'Tech Portfolio'
    };
    render(<Dropdown {...propsWithPortfolio} />);
    fireEvent.click(screen.getByText('GOOG'));

    expect(defaultProps.onItemClick).toHaveBeenCalledWith('GOOG', 'Tech Portfolio');
  });

  it('applies the "open" class when isOpen is true', () => {
    render(<Dropdown {...defaultProps} isOpen={true} />);
    expect(screen.getByTestId('dropdown')).toHaveClass('open');
  });

  it('does not apply the "open" class when isOpen is false', () => {
    render(<Dropdown {...defaultProps} isOpen={false} />);
    expect(screen.getByTestId('dropdown')).not.toHaveClass('open');
  });
});
