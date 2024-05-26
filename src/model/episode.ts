class Episode {
    id: string;
    name: string;
    number: number;
    showId: string;
    seasonNumber: number;
    airDate: string;
    overview: string;
    runtime: number;
    voteCount: number;
    voteAverage: number;
    rating: number;

    constructor(data: any){
        this.id = data.id;
        this.name = data.name;
        this.number = data.season_number;
        this.showId = data.show_id;
        this.seasonNumber = data.season_number;
        this.airDate = data.air_date;
        this.overview = data.overview;
        this.runtime = data.overview;
        this.voteCount = data.vote_count;
        this.voteAverage = data.vote_average
        this.rating = this.voteAverage / 2;
    }
}

export default Episode;
