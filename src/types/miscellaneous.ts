export interface AssigneeRewardMap {
  [assignee: string]: { reward: number; permit: string[] };
}

export interface Bounty {
  permit: {
    permitted: {
      token: string;
      amount: string;
    };
    nonce: string;
    deadline: string;
  };
  transferDetails: {
    to: string;
    requestedAmount: string;
  };
  owner: string;
  signature: string;
}
