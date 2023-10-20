

export const formatSeconds = (durationS: number):string => {

    const roundedS = Math.floor(durationS);

    if(durationS < 0) {
        return '_'
    }

    const seconds = roundedS % 60;

    const minutes = Math.floor((roundedS % 3600)/60);

    const hours = Math.floor(roundedS/3600);

    return `${hours}h ${minutes}m ${seconds}s`;

}