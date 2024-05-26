import constants from '../utils/constants';
import Season from './season';
import Episode from './episode';

class Tvshow {
    id: string;
    title: string;
    language: string;
    overview: string;
    firstAirDate: string;
    lastAirDate: string;
    voteCount: number;
    voteAverage: number;
    rating: number;
    popularity: number;
    posterPath: string;
    backdropPath: string;
    genres: object[];
    tagline: string;
    seasons: Season[];
    specials: Season;
    lastEpisodeToAir: Episode;
    nextEpisodeToAir: Episode;
    streamFirstEpisode: boolean;
    streamLastEpisode: boolean;

    constructor(data: any)  {
        this.id = data.id;
        this.title = data.name;
        this.language = data.original_language;
        this.overview = data.overview;
        this.firstAirDate = data.first_air_date;
        this.lastAirDate = data.last_air_date;
        this.voteCount = data.vote_count;
        this.voteAverage = data.vote_average;
        this.rating = this.voteAverage / 2;
        this.popularity = data.popularity;
        this.posterPath = constants.URL_IMAGE + data.poster_path;
        this.backdropPath = data.backdrop_path ? (constants.URL_IMAGE + data.backdrop_path) : null;
        this.genres = data.geners;
        this.tagline = data.tagline;
        this.seasons = data.seasons.map((season: object) => new Season(season)).filter((season: Season) => season.episodeCount > 0);
        if(this.seasons[0].number === 0) {
            this.specials = this.seasons.splice(0, 1)[0];
        }
        if(data.last_episode_to_air){
            this.lastEpisodeToAir = new Episode(data.last_episode_to_air);
            this.lastAirDate = this.lastEpisodeToAir.airDate || this.lastAirDate;
            this.lastEpisodeToAir.seasonNumber === (this.seasons.length - 1) && (this.seasons[this.seasons.length - 1].episodeCount = this.lastEpisodeToAir.number);
        }
        this.nextEpisodeToAir = data.next_episode_to_air ? new Episode(data.next_episode_to_air) : null;  
    }
}

export default Tvshow;
