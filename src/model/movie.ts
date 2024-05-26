import Certification, { CertificationType } from '../services/Certification';
import constants from '../utils/constants';
import Trailer from './trailer';

class Movie {
    id: string;
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
    certification: CertificationType;

    constructor(data: any)  {
        this.id = data.id;
        this.collectionId = data.belongs_to_collection?.id;
        this.title = data.title;
        this.language = data.original_language;
        this.overview = data.overview;
        this.releaseDate = data.release_date || "";
        this.voteCount = data.vote_count;
        this.voteAverage = data.vote_average;
        this.rating = this.voteAverage / 2;
        this.popularity = data.popularity;
        this.posterPath = constants.URL_IMAGE + data.poster_path;
        this.backdropPath = data.backdrop_path ? (constants.URL_IMAGE + data.backdrop_path) : null;
        this.genres = data.geners;
        this.runtime = data.runtime;
        this.tagline = data.tagline;
        this.videos = data.videos?.results?.map(video => new Trailer(video)).filter((video) => video.official && (video.type === "Trailer" || video.type === "Featurette"));
        
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

        const release_dates = data?.release_dates?.results?.find(result => result.iso_3166_1 === Certification.certificationRegion)?.release_dates;
        this.certification = release_dates?.reduce((curRating, rating) => {
            const cert = Certification.reverseMapCertification(rating.certification, true);
            if(Certification.getCertificationOrder(curRating) < Certification.getCertificationOrder(cert)){
                curRating = cert;
            }
            return curRating;
        }, "NR");
    }
}

export default Movie;