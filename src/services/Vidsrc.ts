import axios from "axios";
import MovieDB from "./MovieDB";
import TvshowDB from "./TvshowDB";
import Certification, { CertificationType } from "./Certification";
import Utils from "../utils/utils";

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

    getNewlyAddedMovies: async (page: number, offset: number, count: number) => {
        const url = Vidsrc.API_BASEURL + 'movie/add/';

        return await Utils.getList(url, page, offset, count, async (item) => {
            try{
                if(item.tmdb_id){
                    const movieModel = item.tmdb_id && await MovieDB.getMovieDetails(item.tmdb_id);
                    movieModel.streamAvailable = true;
                    return movieModel;
                }
            } catch (error){
                console.log(error);
            } 
        });
    },

    getNewlyAddedTvshows: async (page: number, offset: number, count: number) => {
        const url = Vidsrc.API_BASEURL + 'tv/add/';

        return await Utils.getList(url, page, offset, count,  async (item) => {
            try{
                if(item.tmdb_id){
                    const tvshow = await TvshowDB.getTvshowDetails(item.tmdb_id);
                    const [streamFirstEpisode, streamLastEpisode] = await Promise.all([Vidsrc.checkForTvshow(tvshow.id, 1, 1), Vidsrc.checkForTvshow(tvshow.id, tvshow.seasons.length, tvshow.seasons[tvshow.seasons.length - 1].episodeCount - 1)]);
                    tvshow.streamFirstEpisode = streamFirstEpisode;
                    tvshow.streamLastEpisode = streamLastEpisode;
                    return tvshow;
                }
            } catch (error){
                console.log(error);
            } 
        });
    },
}

export default Vidsrc;
