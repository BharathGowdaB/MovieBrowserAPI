
type CertificationType = "NR" | "PG" | "PG-13" | "R" | "NC-17";
export type { CertificationType };

const certificationRegion: string = "US";
const certificationMap: any = {
    "NR": {
        order: 0,
        movie: "NR",
        tvshow: "NR"
    },
    "PG": {
        order: 1,
        movie: "PG",
        tvshow: "TV-PG"
    },
    "PG-13": {
        order: 2,
        movie: "PG-13",
        tvshow: "TV-14"
    },
    "R": {
        order: 3,
        movie: "R",
        tvshow: "TV-MA"
    },
    "NC-17": {
        order: 4,
        movie: "NC-17",
        tvshow: "TV-MA"
    }
}

function getCertificationQuery (certification: CertificationType, isMovie: boolean){
    const cert = certificationMap[certification];
    return `&region=${certificationRegion}&certification_country=${certificationRegion}&certification.gte=${isMovie ? cert.movie : cert.tvshow}`;
}

function mapCertification(certification: CertificationType, isMovie: boolean){
    return isMovie ? certificationMap[certification].movie : certificationMap[certification].tvshow; 
}

function getCertificationOrder(certification: CertificationType){
    return certificationMap[certification]?.order || 0;
}

function reverseMapCertification(cert: string, isMovie: boolean): CertificationType{
    return (Object.keys(certificationMap).find((certification: CertificationType) => isMovie ? certificationMap[certification].movie === cert : certificationMap[certification].tvshow === cert) || "NR") as CertificationType;
}

export default { 
    getCertificationQuery, 
    certificationRegion, 
    mapCertification,
    getCertificationOrder,
    reverseMapCertification
};
