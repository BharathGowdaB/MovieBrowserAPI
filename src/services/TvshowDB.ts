import axios from 'axios';
import constants from "../utils/constants";
import Vidsrc from './Vidsrc';
import Certification, { CertificationType } from './Certification';
import Tvshow from '../model/tvshow';

const TvshowDB = {
    BASEURL: "http://api.themoviedb.org/3/",
    APIKEY: "api_key=c7bbab9fe9f49e2b47a570c1b6c591fb",

    getTvshowDetails: async (id: string) => {
        const url = TvshowDB.BASEURL + "tv/" + id + "?append_to_response=,videos,images,content_ratings&" + TvshowDB.APIKEY + constants.LANGUAGE;
        const response = await axios.get(url);

        return new Tvshow(response.data);
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

    getTvshowList: async (url: string, curPage: number = 1, curOffset: number = 0, count: number = 20) => {
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
            const tvshowData = await Promise.all(response.results.map(async (response) => {
                const tvshow = await TvshowDB.getTvshowDetails(response.id);
                const [streamFirstEpisode, streamLastEpisode] = await Promise.all([Vidsrc.checkForTvshow(tvshow.id, 1, 1), Vidsrc.checkForTvshow(tvshow.id, tvshow.seasons.length, tvshow.seasons[tvshow.seasons.length - 1].episodeCount - 1)]);
                tvshow.streamFirstEpisode = streamFirstEpisode;
                tvshow.streamLastEpisode = streamLastEpisode;
                return tvshow;
            }))

            response.results = tvshowData;
        }
        
        return response;
    },

    getPopularTvshow: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const date = new Date().toISOString().split('T')[0];
        const queryParam = `&sort_by=popularity.desc&vote_count.gte=10&vote_average.lte=10&air_date.lte=${date}${constants.LANGUAGE}`;
        const certificationQuery = new Certification().getInstance().getCertificationQuery(certification, false);

        const url = TvshowDB.BASEURL + "discover/tv?" + TvshowDB.APIKEY + queryParam + certificationQuery;
        return await TvshowDB.getTvshowList(url, page, offset, count);
    },

    getUpcomingTvshow: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date(Date.now() + constants.MONTH_IN_MILLISECONDS).toISOString().split('T')[0];
        const queryParam = `&sort_by=popularity.desc&air_date.gte=${startDate}&air_date.lte=${endDate}${constants.LANGUAGE}`;
        const certificationQuery = new Certification().getInstance().getCertificationQuery(certification, false);
        
        const url = TvshowDB.BASEURL + "discover/tv?" + TvshowDB.APIKEY + queryParam + certificationQuery;
        return await TvshowDB.getTvshowList(url, page, offset, count);
    },

    getTopRatedTvshow: async (certification: CertificationType, page: number, offset: number, count: number) => {
        const queryParam = `&sort_by=vote_average.desc&vote_count.gte=200&vote_average.lte=10${constants.LANGUAGE}`;
        const certificationQuery = new Certification().getInstance().getCertificationQuery(certification, false);
        
        const url = TvshowDB.BASEURL + "discover/tv?" + TvshowDB.APIKEY + queryParam + certificationQuery;
        return await TvshowDB.getTvshowList(url, page, offset, count);
    },

    searchTvshow: async (query: string, page: number, offset: number, count: number) => {
        const queryParam = `&query=${query}`;

        const url = TvshowDB.BASEURL + "search/tv?" + TvshowDB.APIKEY + queryParam;
        return await TvshowDB.getTvshowList(url, page, offset, count);
    }
}

export default TvshowDB;
