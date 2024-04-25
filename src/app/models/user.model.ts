export class User {
  userId: number;
  headingArray: number[];
  lat: number;
  long: number;

  constructor(userId: number, headingArray: number[], lat: number, long: number) {
    this.userId = userId;
    this.headingArray = headingArray;
    this.lat = lat;
    this.long = long;
  }
}
