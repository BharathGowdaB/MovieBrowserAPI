import constants from '../utils/constants';

class Season {
    id: string;
    name: string;
    number: number;
    airDate: string;
    overview: string;
    posterPath: string;
    episodeCount: number;
    voteAverage: number;
    rating: number;

    constructor(data: any){
        this.id = data.id;
        this.name = data.name;
        this.number = data.season_number;
        this.airDate = data.air_date;
        this.overview = data.overview;
        this.posterPath = constants.URL_IMAGE + data.poster_path;
        this.episodeCount = data.episode_count;
        this.voteAverage = data.vote_average
        this.rating = this.voteAverage / 2;
    }
}

export default Season;
