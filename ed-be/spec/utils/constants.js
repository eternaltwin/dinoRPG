import jest from 'jest-mock';

// Player constants
export const playerId = '12345';
export const playerId2 = '54321';

// Dinoz constants
export const dinozId = '123456789';
export const dinozId2 = '987654321';
export const display = 'A0AwaJJ6KdVyP000';
export const dinozName = 'Skiry';

// Rewards
export const rewardName1 = 'tropheeRocky';
export const rewardName2 = 'tropheePteroz';

// HTTP status
export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_UNAUTHORIZED = 401;
export const SERVER_ERROR = 500;

// Mocked request
export const mockedReq = {
    user: {
        playerId: playerId
    }
};

// Mocked response
export const mockedRes = () => {
    const mockResponse = {};
    mockResponse.status = jest.fn().mockReturnValue(mockResponse);
    mockResponse.send = jest.fn().mockReturnValue(mockResponse);
    return mockResponse;
};

// Mocked configuration
export const config = {
    shop: {
        buyableQuetzu: 6
    }
}