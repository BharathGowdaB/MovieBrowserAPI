import axios from 'axios';
import constants from "../utils/constants";
import utils from '../utils/utils';
import Movie from '../model/movie';
import Vidsrc from './Vidsrc';
import Certification, { CertificationType } from './Certification';
import Trailer from '../model/trailer';
import Collection from '../model/collection';

const MovieDB = {
    BASEURL: "http://api.themoviedb.org/3/",
    APIKEY: "api_key=c7bbab9fe9f49e2b47a570c1b6c591fb",

    getMovieDetails: async (id: string) => {
        const url = MovieDB.BASEURL + "movie/" + id + "?append_to_response=,videos,images&" + MovieDB.APIKEY + constants.LANGUAGE;
        const response = await axios.get(url);

        const trailers = response.data.videos?.results?.map(video => new Trailer(video));
        return new Movie(response.data, trailers);
    },

    getMovieById: async (id: string) => {
        const movie = await MovieDB.getMovieDetails(id);

        const [collection, recommendations] = await Promise.all([movie.collectionId && MovieDB.getMovieCollection(movie.collectionId), MovieDB.getMovieRecommendation(movie.id)]);

        return {
            movie,
            collection,
            recommendations
        }
    },

    getMovieCollection: async (id: string) => {
        const url = MovieDB.BASEURL + 'collection/' + id + '?' + MovieDB.APIKEY + constants.LANGUAGE;
        const res = await axios.get(url);

        let movieData = [];
        if(res.data?.parts?.length) {
            movieData = await Promise.all(res.data.parts.map(movie => MovieDB.getMovieDetails(movie.id)));
        }

        return new Collection(res.data, movieData);
    },

    getMovieRecommendation: async(id: string) => {
        const url = MovieDB.BASEURL + 'movie/' + id + '/recommendations?' + MovieDB.APIKEY + constants.LANGUAGE;
        const res = await axios.get(url);

        let movieData = [];
        if(res.data?.results?.length) {
            movieData = await Promise.all(res.data.results.map(movie => MovieDB.getMovieDetails(movie.id)));
        }

        return movieData;
    },

    getMovieList: async (url: string, curPage: number = 1, curOffset: number = 0, count: number = 20) => {
        const results = [];

        while(results.length < count) {
            const res = await axios.get(`${url}&page=${curPage}`);
            const items = res.data?.results;
            if(!items?.length){
                break;
            } else {
                while (curOffset < items.length && results.length < count){
                    results.push(items[curOffset++]);
                }
                if(curOffset === items.length){
                    curOffset = 0;
                    curPage++;
                }
            }
        }

        const response = {
            count: results.length,
            nextPage: curPage,
            nextOffset: curOffset,
            results
        };
        
        if(response.results.length){
            const movieData = await Promise.all(response.results.map(async (movie) => {
                return await MovieDB.getMovieDetails(movie.id);
            }))

            await Promise.all(movieData.map(async (movie) => {
                const streamAvailable = await Vidsrc.checkForMovie(movie.imdbId);
                movie.streamAvailable = streamAvailable;
            }))
            response.results = movieData;
        }
        
        return response;
    },

    getPopularMovies: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const date = new Date().toISOString().split('T')[0];
        const queryParam = `&sort_by=popularity.desc&vote_count.gte=10&vote_average.lte=10&primary_release_date.lte=${date}${constants.LANGUAGE}`;
        const certificationQuery = new Certification().getInstance().getCertificationQuery(certification);

        const url = MovieDB.BASEURL + "discover/movie?" + MovieDB.APIKEY + queryParam + certificationQuery;
        return await MovieDB.getMovieList(url, page, offset, count);
    },

    getUpcomingMovies: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + constants.MONTH_IN_MILLISECONDS).toISOString().split('T')[0];
        const queryParam = `&sort_by=popularity.desc&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}${constants.LANGUAGE}`;
        const certificationQuery = new Certification().getInstance().getCertificationQuery(certification);
        
        const url = MovieDB.BASEURL + "discover/movie?" + MovieDB.APIKEY + queryParam + certificationQuery;
        return await MovieDB.getMovieList(url, page, offset, count);
    },

    getTopRatedMovies: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const queryParam = `&sort_by=vote_average.desc&vote_count.gte=200&vote_average.lte=10${constants.LANGUAGE}`;
        const certificationQuery = new Certification().getInstance().getCertificationQuery(certification);
        
        const url = MovieDB.BASEURL + "discover/movie?" + MovieDB.APIKEY + queryParam + certificationQuery;
        return await MovieDB.getMovieList(url, page, offset, count);
    },
}

export default MovieDB;