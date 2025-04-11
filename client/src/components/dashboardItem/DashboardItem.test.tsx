import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardItem from './DashboardItem';
import '@testing-library/jest-dom';

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span className={`mock-icon ${props.icon.iconName}`} data-testid="mock-icon" />
}));

describe('DashboardItem Component', () => {
  const defaultProps = {
    name: 'Apple Inc.',
    symbol: 'AAPL',
    price: 198.5,
    change: 2.3,
    percentChange: 1.17,
    onClick: jest.fn(),
    onClickDelete: jest.fn(),
    animationDelay: 0
  };

  it('renders correctly with required props', () => {
    render(<DashboardItem {...defaultProps} />);
    
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('$198.50')).toBeInTheDocument();
    expect(screen.getByText('2.30 (1.17%)')).toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toHaveClass('arrow-up');
  });

  it('should call onClick when clicking the dashboard item', () => {
    render(<DashboardItem {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Apple Inc.').closest('.dashboard__item')!);
    
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('should not show delete button when portfolio prop is not provided', () => {
    render(<DashboardItem {...defaultProps} />);
    
    const deleteButtons = screen.queryAllByTestId('mock-icon').filter(icon => icon.classList.contains('trash'));
    expect(deleteButtons.length).toBe(0);
  });

  it('should show delete button when portfolio prop is true', () => {
    render(<DashboardItem {...defaultProps} portfolio={true} />);
    
    const deleteButtons = screen.queryAllByTestId('mock-icon').filter(icon => icon.classList.contains('trash'));
    expect(deleteButtons.length).toBe(1);
  });

  it('should call onClickDelete when clicking the delete button', () => {
    render(<DashboardItem {...defaultProps} portfolio={true} />);
    
    const deleteButton = screen.queryAllByTestId('mock-icon')
      .find(icon => icon.classList.contains('trash'))!
      .closest('.dashboard__item__delete')!;
    
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onClickDelete).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClick).not.toHaveBeenCalled();
  });

  it('applies the correct styling for price increases', () => {
    render(<DashboardItem {...defaultProps} />);
    
    const dashboardItem = screen.getByText('Apple Inc.').closest('.dashboard__item');
    expect(dashboardItem).toHaveClass('increased');
    expect(dashboardItem).not.toHaveClass('decreased');
    
    const changeElement = screen.getByText('2.30 (1.17%)').closest('.dashboard__item__change');
    expect(changeElement).toHaveClass('stock-up');
    expect(changeElement).not.toHaveClass('stock-down');
  });

  it('applies the correct styling for price decreases', () => {
    render(<DashboardItem {...defaultProps} change={-2.3} percentChange={-1.17} />);
    
    const dashboardItem = screen.getByText('Apple Inc.').closest('.dashboard__item');
    expect(dashboardItem).toHaveClass('decreased');
    expect(dashboardItem).not.toHaveClass('increased');
    
    const changeElement = screen.getByText('2.30 (1.17%)').closest('.dashboard__item__change');
    expect(changeElement).toHaveClass('stock-down');
    expect(changeElement).not.toHaveClass('stock-up');
  });

  it('displays absolute values for change and percentChange', () => {
    render(<DashboardItem {...defaultProps} change={-2.3} percentChange={-1.17} />);
    
    expect(screen.getByText('2.30 (1.17%)')).toBeInTheDocument();
  });

  it('applies the animation delay style', () => {
    render(<DashboardItem {...defaultProps} animationDelay={2} />);
    
    const dashboardItem = screen.getByText('Apple Inc.').closest('.dashboard__item');
    expect(dashboardItem).toHaveStyle('animation-delay: 200ms');
  });
});