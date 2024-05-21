class Trailer {
    id: string;
    key: string;
    url: string;
    type: string;
    official: boolean;
    size: number;
    publishedAt: Date;

    constructor(data: any){
        this.id = data.id;
        this.key = data.key;
        this.url = data.site === "YouTube" ? ("https://www.youtube.com/watch?v=" + data.key) : null;
        this.type = data.type;
        this.official = data.official;
        this.size = data.size;
        this.publishedAt = new Date(data.published_at);
    }

}

export default Trailer;
