import axios from "axios";
import MovieDB from "./MovieDB";
import TvshowDB from "./TvshowDB";

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

    checkForTvshow: async (id: string, seasonNumber: number = 1, episodeNumber: number = 1) => {
        try {
            await axios.get(Vidsrc.BASEURL + "tv/" + id + "/" + seasonNumber + "/" + episodeNumber);
            return true;
        } catch (error){
            return false;
        }
    },

    getList: async (url: string, curPage: number = 1, curOffset: number = 0, count: number = 20, isMovieData) => {
        const results = [];

        while(results.length < count) {
            const res = await axios.get(`${url}${curPage}`);
            const items = res.data?.result?.items;
            if(!items?.length){
                break;
            } else {
                while (curOffset < items.length && results.length < count){
                    if(items[curOffset].tmdb_id) results.push(items[curOffset]);
                    curOffset++;
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
            const data = isMovieData ? await Promise.all(response.results.map(async (movie) => {
                const movieModel = await MovieDB.getMovieDetails(movie.tmdb_id);
                movieModel.streamAvailable = true;
                return movieModel;
            })) : await Promise.all(response.results.map(async (tvshow) => {
                const tvshowModel = await TvshowDB.getTvshowDetails(tvshow.tmdb_id);
                const [streamFirstEpisode, streamLastEpisode] = await Promise.all([Vidsrc.checkForTvshow(tvshowModel.id, 1, 1), Vidsrc.checkForTvshow(tvshowModel.id, tvshowModel.seasons.length, tvshowModel.seasons[tvshowModel.seasons.length - 1].episodeCount - 1)]);
                tvshowModel.streamFirstEpisode = streamFirstEpisode;
                tvshowModel.streamLastEpisode = streamLastEpisode;
                return tvshowModel;
            }))


            response.results = data;
        }
        return response;
    },

    getNewlyAddedMovies: async (page: number, offset: number, count: number) => {
        const url = Vidsrc.API_BASEURL + 'movie/add/';

        return await Vidsrc.getList(url, page, offset, count, true);
    },

    getNewlyAddedTvshows: async (page: number, offset: number, count: number) => {
        const url = Vidsrc.API_BASEURL + 'tv/add/';

        return await Vidsrc.getList(url, page, offset, count, false);
    },
}

export default Vidsrc;
