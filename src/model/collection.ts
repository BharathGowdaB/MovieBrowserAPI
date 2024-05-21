import constants from '../utils/constants';
import Movie from './movie';

class Collection {
    id: string;
    name: string;
    overview: string;
    posterPath: string;
    backdropPath: string;
    parts: Movie[];

    constructor(data: any, parts: Movie[] = []){
        this.id = data.id;
        this.name = data.name;
        this.overview = data.overview;
        this.posterPath = constants.URL_IMAGE + data.poster_path;
        this.backdropPath = data.backdrop_path ? (constants.URL_IMAGE + data.backdrop_path) : null;
        this.parts = parts;
    }
}

export default Collection;
