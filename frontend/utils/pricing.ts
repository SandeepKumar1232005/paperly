export const calculateSuggestedPrice = (subject: string, deadline: string, baseRate = 10): number => {
    const now = new Date();
    const dead = new Date(deadline);

    if (isNaN(dead.getTime())) return 50; // Default if invalid

    // Difference in hours
    const diffHours = (dead.getTime() - now.getTime()) / (1000 * 60 * 60);

    let multiplier = 1;

    // Urgency multiplier
    if (diffHours < 24) multiplier *= 2.0;
    else if (diffHours < 48) multiplier *= 1.5;
    else if (diffHours < 72) multiplier *= 1.2;

    // Subject complexity (mock)
    const complexityMap: Record<string, number> = {
        'math': 1.2,
        'physics': 1.2,
        'engineering': 1.3,
        'history': 1.0,
        'english': 1.0,
        'law': 1.25,
        'medical': 1.4
    };

    const subjectLower = subject.toLowerCase();
    const subjectMultiplier = Object.keys(complexityMap).find(k => subjectLower.includes(k))
        ? complexityMap[Object.keys(complexityMap).find(k => subjectLower.includes(k))!]
        : 1.0;

    // Assume standard page count of ~5 for MVP calculator if not specified, 
    // or just return a base "Project Price"

    return Math.round(baseRate * 5 * multiplier * subjectMultiplier);
};
