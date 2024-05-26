import axios from 'axios';
import constants from "../utils/constants";
import Movie from '../model/movie';
import Vidsrc from './Vidsrc';
import Certification, { CertificationType } from './Certification';
import Collection from '../model/collection';
import Utils from '../utils/utils';

const MovieDB = {
    BASEURL: "http://api.themoviedb.org/3/",
    APIKEY: "api_key=c7bbab9fe9f49e2b47a570c1b6c591fb",

    getMovieDetails: async (id: string) => {
        try{
            const url = MovieDB.BASEURL + "movie/" + id + "?append_to_response=,videos,images,recommendations,release_dates&" + MovieDB.APIKEY + constants.LANGUAGE;
            const response = await axios.get(url);
    
            return new Movie(response.data);
        } catch(error){
            if(error?.response?.status === 404){
                throw {
                    status: 404,
                    statusText: 'Not Found'
                };
            }
            throw error;
        }
        
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

    getListCallback: async (item) => {
        try{
            const [movieData, streamAvailable] = await Promise.all([MovieDB.getMovieDetails(item?.id), Vidsrc.checkForMovie(item?.id)]);
            movieData.streamAvailable = streamAvailable;
            return movieData;
        } catch (error) {
            console.log(error);
        }
    },

    getPopularMovies: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const date = new Date().toISOString().split('T')[0];
        const queryParam = `&sort_by=popularity.desc&vote_count.gte=10&vote_average.lte=10&primary_release_date.lte=${date}${constants.LANGUAGE}`;
        const certificationQuery = Certification.getCertificationQuery(certification, true);

        const url = MovieDB.BASEURL + "discover/movie?" + MovieDB.APIKEY + queryParam + certificationQuery;
        return await Utils.getList(url, page, offset, count, MovieDB.getListCallback);
    },

    getUpcomingMovies: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + constants.MONTH_IN_MILLISECONDS).toISOString().split('T')[0];
        const queryParam = `&sort_by=popularity.desc&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}${constants.LANGUAGE}`;
        const certificationQuery = Certification.getCertificationQuery(certification, true);
        
        const url = MovieDB.BASEURL + "discover/movie?" + MovieDB.APIKEY + queryParam + certificationQuery;
        return await Utils.getList(url, page, offset, count, MovieDB.getListCallback);
    },

    getTopRatedMovies: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const queryParam = `&sort_by=vote_average.desc&vote_count.gte=200&vote_average.lte=10${constants.LANGUAGE}`;
        const certificationQuery = Certification.getCertificationQuery(certification, true);
        
        const url = MovieDB.BASEURL + "discover/movie?" + MovieDB.APIKEY + queryParam + certificationQuery;
        return await Utils.getList(url, page, offset, count, MovieDB.getListCallback);
    },

    searchMovie: async (query: string, certification: CertificationType, page: number, offset: number, count: number) => {
        const queryParam = `&query=${query}`;
        const certificationOrder = Certification.getCertificationOrder(certification);

        const url = MovieDB.BASEURL + "search/movie?" + MovieDB.APIKEY + queryParam;
        return await Utils.getList(url, page, offset, count,  async (item) => {
            try{
                const movieModel = await MovieDB.getMovieDetails(item?.id);
                if(certificationOrder <= Certification.getCertificationOrder(movieModel.certification)){
                    movieModel.streamAvailable = true;
                    return movieModel;
                }
            } catch (error){
                console.log(error);
            } 
        });
    }
}

export default MovieDB;