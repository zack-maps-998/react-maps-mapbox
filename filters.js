    const out=[]
    export function preprocessData(data) {
        if (!data || !data.events) {
            return [];
        }
        const events=Array.isArray(data.events)?data.events:[]
        for (let i=0;i<events.length;i++)
            {
                const id=events[i].id
                const title=events[i].title
                const description=events[i].description
                const link=events[i].link
                const categories=events[i].categories
                const sources=events[i].sources
                const geometry=events[i].geometry
                const coords=geometry[0]
                const [lon, lat] = Array.isArray(coords?.coordinates) ? coords.coordinates : [];
                const date=coords?.date
                out.push({id:id,title:title,description:description,link:link,categories:categories,sources:sources,geometry:geometry,lon:lon,lat:lat,date:date}) 
            }
        // console.log(out)
        return out;
    }


    export const toEpochMs = d => (typeof d === "number" ? d : Date.parse(d));
    export const toISO = d => new Date(toEpochMs(d)).toISOString();

    export function filterByDateRange(data, startDate, endDate) {
        const startDateMs = toEpochMs(startDate);
        const endDateMs = toEpochMs(endDate);
        return (Array.isArray(data) ? data : []).filter(e => {
               const t = toEpochMs(e?.date);
               return Number.isFinite(t) && t >= startMs && t < endMs;
  });
        
    }