export interface VoteComment {
  id?: number;
  voteID: number;
  generalID: number;
  nationID: number;
  nationName: string;
  generalName: string;
  text: string;
  date: string;
}
