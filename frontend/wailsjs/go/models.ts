export namespace main {
	
	export class Account {
	    id: string;
	    username: string;
	    avatarPath: string;
	
	    static createFrom(source: any = {}) {
	        return new Account(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.avatarPath = source["avatarPath"];
	    }
	}
	export class DimensionSettings {
	    scoring: ScoringSettings;
	
	    static createFrom(source: any = {}) {
	        return new DimensionSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.scoring = this.convertValues(source["scoring"], ScoringSettings);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Task {
	    id: string;
	    title: string;
	    description: string;
	    status: string;
	    score: number;
	    priority: string;
	    startDate?: string;
	    endDate?: string;
	
	    static createFrom(source: any = {}) {
	        return new Task(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.description = source["description"];
	        this.status = source["status"];
	        this.score = source["score"];
	        this.priority = source["priority"];
	        this.startDate = source["startDate"];
	        this.endDate = source["endDate"];
	    }
	}
	export class DimensionData {
	    annualGoal: string;
	    quarterlyGoals: string[];
	    monthlyTasks: Task[][];
	    totalScore: number;
	    completedTasks: number;
	    totalTasks: number;
	    progress: number;
	    settings: DimensionSettings;
	
	    static createFrom(source: any = {}) {
	        return new DimensionData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.annualGoal = source["annualGoal"];
	        this.quarterlyGoals = source["quarterlyGoals"];
	        this.monthlyTasks = this.convertValues(source["monthlyTasks"], Task);
	        this.totalScore = source["totalScore"];
	        this.completedTasks = source["completedTasks"];
	        this.totalTasks = source["totalTasks"];
	        this.progress = source["progress"];
	        this.settings = this.convertValues(source["settings"], DimensionSettings);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DimensionConfig {
	    key: string;
	    title: string;
	    icon: string;
	    color: string;
	    isDefault: boolean;
	
	    static createFrom(source: any = {}) {
	        return new DimensionConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.title = source["title"];
	        this.icon = source["icon"];
	        this.color = source["color"];
	        this.isDefault = source["isDefault"];
	    }
	}
	export class ScoringSettings {
	    completedScore: number;
	    inProgressScore: number;
	    notStartedScore: number;
	    dimensionWeights?: Record<string, number>;
	
	    static createFrom(source: any = {}) {
	        return new ScoringSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.completedScore = source["completedScore"];
	        this.inProgressScore = source["inProgressScore"];
	        this.notStartedScore = source["notStartedScore"];
	        this.dimensionWeights = source["dimensionWeights"];
	    }
	}
	export class AnnualSettings {
	    scoring: ScoringSettings;
	
	    static createFrom(source: any = {}) {
	        return new AnnualSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.scoring = this.convertValues(source["scoring"], ScoringSettings);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AnnualData {
	    year: string;
	    totalScore: number;
	    settings: AnnualSettings;
	    dimensionConfigs: DimensionConfig[];
	    dimensions: Record<string, DimensionData>;
	
	    static createFrom(source: any = {}) {
	        return new AnnualData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.year = source["year"];
	        this.totalScore = source["totalScore"];
	        this.settings = this.convertValues(source["settings"], AnnualSettings);
	        this.dimensionConfigs = this.convertValues(source["dimensionConfigs"], DimensionConfig);
	        this.dimensions = this.convertValues(source["dimensions"], DimensionData, true);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class CheckUpdateResult {
	    updateAvailable: boolean;
	    currentVersion: string;
	    latestVersion: string;
	    releaseNotes: string;
	    downloadURL: string;
	
	    static createFrom(source: any = {}) {
	        return new CheckUpdateResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.updateAvailable = source["updateAvailable"];
	        this.currentVersion = source["currentVersion"];
	        this.latestVersion = source["latestVersion"];
	        this.releaseNotes = source["releaseNotes"];
	        this.downloadURL = source["downloadURL"];
	    }
	}
	
	
	
	

}

