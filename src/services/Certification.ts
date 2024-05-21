
type CertificationType = "NR" | "PG" | "PG-13" | "R" | "NC-17";

class Certification {
    certification: Certification;
    certificationRegion:string = "US";
    certificationMap: any = {
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

    getInstance(){
        if(!this.certification){
            this.certification = new Certification();
        }
        return this.certification;
    }

    getCertificationQuery = (certification: CertificationType, isMovie: boolean = true) => {
        const cert = this.certificationMap[certification];
        return`&region=${this.certificationRegion}&certification_country=${this.certificationRegion}&certification.gte=${isMovie ? cert.movie : cert.tvshow}`;
    }
}

export default Certification;
export type { CertificationType };