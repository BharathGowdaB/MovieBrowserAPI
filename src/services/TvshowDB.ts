import axios from 'axios';
import constants from "../utils/constants";
import Vidsrc from './Vidsrc';
import Certification, { CertificationType } from './Certification';
import Tvshow from '../model/tvshow';
import Utils from '../utils/utils';

const TvshowDB = {
    BASEURL: "http://api.themoviedb.org/3/",
    APIKEY: "api_key=c7bbab9fe9f49e2b47a570c1b6c591fb",

    getTvshowDetails: async (id: string) => {
        try{
            const url = TvshowDB.BASEURL + "tv/" + id + "?append_to_response=,videos,images,content_ratings&" + TvshowDB.APIKEY + constants.LANGUAGE;
            const response = await axios.get(url);

            return new Tvshow(response.data);
        } catch(error){
            if(error?.response?.status === 404){
                throw {
                    id,
                    status: 404,
                    statusText: 'Not Found'
                };
            }
            throw error;
        }
        
    },

    getTvshowById: async (id: string) => {
        const tvshow = await TvshowDB.getTvshowDetails(id);
        const recommendations = await  TvshowDB.getTvshowRecommendation(tvshow.id);

        return {
            tvshow,
            recommendations
        }
    },

    getTvshowRecommendation: async(id: string) => {
        const url = TvshowDB.BASEURL + 'tv/' + id + '/recommendations?' + TvshowDB.APIKEY + constants.LANGUAGE;
        const res = await axios.get(url);

        let tvshowData = [];
        if(res.data?.results?.length) {
            tvshowData = await Promise.all(res.data.results.map(tvshow => TvshowDB.getTvshowDetails(tvshow.id)));
        }

        return tvshowData;
    },

    getListCallback: async (item) => {
        try{
            const tvshow = await TvshowDB.getTvshowDetails(item?.id);
            const [streamFirstEpisode, streamLastEpisode] = await Promise.all([Vidsrc.checkForTvshow(tvshow.id, 1, 1), Vidsrc.checkForTvshow(tvshow.id, tvshow.seasons.length, tvshow.seasons[tvshow.seasons.length - 1].episodeCount - 1)]);
            tvshow.streamFirstEpisode = streamFirstEpisode;
            tvshow.streamLastEpisode = streamLastEpisode;
            return tvshow;
        } catch (error) {
            console.log(error);
        }
    },

    getPopularTvshow: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const date = new Date().toISOString().split('T')[0];
        const queryParam = `&sort_by=popularity.desc&vote_count.gte=10&vote_average.lte=10&air_date.lte=${date}${constants.LANGUAGE}`;
        const certificationQuery = Certification.getCertificationQuery(certification, false);

        const url = TvshowDB.BASEURL + "discover/tv?" + TvshowDB.APIKEY + queryParam + certificationQuery + "&";
        return await Utils.getList(url, page, offset, count, TvshowDB.getListCallback);
    },

    getUpcomingTvshow: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + constants.MONTH_IN_MILLISECONDS).toISOString().split('T')[0];
        const queryParam = `&sort_by=popularity.desc&air_date.gte=${startDate}&air_date.lte=${endDate}${constants.LANGUAGE}`;
        const certificationQuery = Certification.getCertificationQuery(certification, false);
        
        const url = TvshowDB.BASEURL + "discover/tv?" + TvshowDB.APIKEY + queryParam + certificationQuery + "&";
        return await Utils.getList(url, page, offset, count, TvshowDB.getListCallback);
    },

    getTopRatedTvshow: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const queryParam = `&sort_by=vote_average.desc&vote_count.gte=200&vote_average.lte=10${constants.LANGUAGE}`;
        const certificationQuery = Certification.getCertificationQuery(certification, false);
        
        const url = TvshowDB.BASEURL + "discover/tv?" + TvshowDB.APIKEY + queryParam + certificationQuery + "&";
        return await Utils.getList(url, page, offset, count, TvshowDB.getListCallback);
    },

    searchTvshow: async (query: string, certification: CertificationType, page: number, offset: number, count: number) => {
        const queryParam = `&query=${query}`;
        const certificationOrder = Certification.getCertificationOrder(certification);

        const url = TvshowDB.BASEURL + "search/tv?" + TvshowDB.APIKEY + queryParam + "&";
        return await Utils.getList(url, page, offset, count, async (item) => {
            try{
                const tvshow = await TvshowDB.getTvshowDetails(item?.id);
                if(certificationOrder <= Certification.getCertificationOrder(tvshow.certification)){
                    const [streamFirstEpisode, streamLastEpisode] = await Promise.all([Vidsrc.checkForTvshow(tvshow.id, 1, 1), Vidsrc.checkForTvshow(tvshow.id, tvshow.seasons.length, tvshow.seasons[tvshow.seasons.length - 1].episodeCount - 1)]);
                    tvshow.streamFirstEpisode = streamFirstEpisode;
                    tvshow.streamLastEpisode = streamLastEpisode;
                    return tvshow;
                }
            } catch (error) {
                console.log(error);
            }
        });
    }
}

export default TvshowDB;
