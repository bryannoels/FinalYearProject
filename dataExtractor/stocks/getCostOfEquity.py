def get_cost_of_equity(beta):
    risk_free_rate = 0.045
    expected_market_return = 0.10
    cost_of_equity = risk_free_rate + beta * (expected_market_return - risk_free_rate)
    return cost_of_equity

