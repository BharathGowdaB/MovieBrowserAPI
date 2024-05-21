import format from 'date-format';
import constants from '../utils/constants';
import Trailer from './trailer';

class Tvshow {
    id: string;
    imdbId: string;
    collectionId: string;
    title: string;
    language: string;
    overview: string;
    releaseDate: string;
    voteCount: number;
    voteAverage: number;
    rating: number;
    popularity: number;
    posterPath: string;
    backdropPath: string;
    genres: object[];
    runtime: number;
    tagline: string;
    streamAvailable: boolean;
    videos: Trailer[];
    hasTrailer: boolean;
    trailer: Trailer;

    constructor(data: any, trailers: Trailer[] = [])  {
        this.id = data.id;
        this.imdbId = data.imdb_id;
        this.collectionId = data.belongs_to_collection?.id;
        this.title = data.title;
        this.language = data.original_language;
        this.overview = data.overview;
        this.releaseDate = data.release_date;
        this.voteCount = data.vote_count;
        this.voteAverage = data.vote_average;
        this.rating = this.voteAverage / 2;
        this.popularity = data.popularity;
        this.posterPath = constants.URL_IMAGE + data.poster_path;
        this.backdropPath = data.backdrop_path ? (constants.URL_IMAGE + data.backdrop_path) : null;
        this.genres = data.geners;
        this.runtime = data.runtime;
        this.tagline = data.tagline;
        this.videos = trailers.filter((video) => video.official && (video.type === "Trailer" || video.type === "Featurette"));
        
        let latestTrailer = this.videos.find((video) => video.type === "Trailer" && video.url);
        if(latestTrailer){
            this.videos.forEach((video) => {
                if(video.type === "Trailer" && video.url && latestTrailer.publishedAt < video.publishedAt){
                    latestTrailer = video;
                }
            })
            this.hasTrailer = true;
            this.trailer = latestTrailer;
        } else {
            this.hasTrailer = false;
            this.trailer = null;
        }
    }
}

export default Tvshow;