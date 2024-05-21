import axios from "axios";
import utils from "../utils/utils";
import MovieDB from "./MovieDB";

const Vidsrc = {
    BASEURL: "https://vidsrc.to/embed/",
    API_BASEURL: "https://vidsrc.to/vapi/",

    checkForMovie: async (id: string) => {
        try {
            await axios.get(Vidsrc.BASEURL + "movie/" + id);
            return true;
        } catch (error){
            return false;
        }
    },

    getMovieList: async (url: string, curPage: number = 1, curOffset: number = 0, count: number = 20) => {
        const results = [];

        while(results.length < count) {
            const res = await axios.get(`${url}${curPage}`);
            const items = res.data?.result?.items;
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
                const movieModel = await MovieDB.getMovieDetails(movie.imdb_id);
                movieModel.streamAvailable = true;
                return movieModel;
            }))

            response.results = movieData;
        }
        return response;
    },

    getNewlyAddedMovies: async (page: number, offset: number, count: number) => {
        const url = Vidsrc.API_BASEURL + 'movie/add/';

        return await Vidsrc.getMovieList(url, page, offset, count);
    }
}

export default Vidsrc;