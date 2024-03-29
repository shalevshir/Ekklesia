import BaseRepo from '../../abstracts/repo.abstract';
import MinistryModel, { Ministry } from './ministry.model';

class MinistryRepo extends BaseRepo<Ministry> {
  ministerToCategoryMap: Record<string, string> = {
    'המשרד לשירותי דת': '65d4787076e4a97122327c9b', // דת ומדינה
    'משרד האנרגיה והתשתיות': '65be8cba5867b500fd71e7ea', // תשתיות ותחבורה
    'המשרד לשוויון חברתי': '65be68105867b500fd71e7dd', // שוויון
    'משרד המורשת': '65be68105867b500fd71e7d6', // תרבות וספורט
    'משרד הקשר בין הממשלה לכנסת': '65be68105867b500fd71e7dc', // ביקורת המדינה
    'משרד התפוצות והמאבק באנטישמיות': '65be68105867b500fd71e7d3', // חוץ וביטחון
    'משרד הרווחה והביטחון החברתי': '65be68105867b500fd71e7d9', // עבודה ורווחה
    'משרד הבינוי והשיכון': '65be68105867b500fd71e7db', // פנים
    'משרד ראש הממשלה': '65be68105867b500fd71e7dc', // ביקורת המדינה
    'משרד הבריאות': '65be68105867b500fd71e7d2', // בריאות
    'משרד הפנים': '65be68105867b500fd71e7db', // פנים
    'משרד החקלאות ופיתוח הכפר': '65be68105867b500fd71e7d7', // כלכלה
    'משרד התפוצות': '65be68105867b500fd71e7da', // עליה קליטה ותפוצות
    'משרד העלייה והקליטה': '65be68105867b500fd71e7da', // עליה קליטה ותפוצות
    'משרד המשפטים': '65be68105867b500fd71e7d4', // חוק ומשפט
    'משרד ירושלים ומורשת': '65be68105867b500fd71e7d6', // תרבות וספורט
    'המשרד להגנת הסביבה': '65be76615867b500fd71e7e3', // איכות הסביבה ואקלים
    'משרד החוץ': '65be68105867b500fd71e7d3', // חוץ וביטחון
    'משרד ירושלים ומסורת ישראל': '65be68105867b500fd71e7d6', // תרבות וספורט
    'המשרד לביטחון לאומי': '65be68105867b500fd71e7d1', // ביטחון פנים
    'משרד ההתיישבות והמשימות הלאומיות': '65d4797a76e4a97122327c9c', // אולי עניין יו״ש והפלסטינים צריך להיות קטגוריה?
    'משרד התקשורת': '65be8cba5867b500fd71e7ea', // תשתיות ותחבורה?
    'המשרד לקידום מעמד האישה': '65be68105867b500fd71e7dd', // שוויון
    'המשרד לעניינים אסטרטגיים': '65be68105867b500fd71e7d3', // מי צריך משרד כזה בכלל? שמתי חוץ וביטחון
    'משרד הביטחון': '65be68105867b500fd71e7d3', // חוץ וביטחון
    'משרד החדשנות, המדע והטכנולוגיה': '65be68105867b500fd71e7d8', // מדע וטכנולוגיה
    'משרד התחבורה והבטיחות בדרכים': '65be8cba5867b500fd71e7ea', // תשתיות ותחבורה
    'משרד האנרגיה': '65be8cba5867b500fd71e7ea', // תשתיות ותחבורה
    'המשרד לנושאים אסטרטגיים והסברה': '65be68105867b500fd71e7d3', // חוץ וביטחון
    'משרד התיירות': '65be68105867b500fd71e7d6', // תרבות וספורט
    'משרד התרבות והספורט': '65be68105867b500fd71e7d6', // תרבות וספורט
    'משרד העבודה': '65be68105867b500fd71e7d9', // עבודה ורווחה
    'המשרד לביטחון הפנים': '65be68105867b500fd71e7d1', // ביטחון פנים
    'המשרד לשיתוף פעולה אזורי': '65be68105867b500fd71e7d3', // חוץ וביטחון
    'המשרד לשוויון חברתי וקידום מעמד האישה': '65be68105867b500fd71e7dd', // שוויון
    'המשרד לחיזוק ולקידום קהילתי': '65be68105867b500fd71e7dd', // שוויון
    'משרד האוצר': '65be68105867b500fd71e7d0', // כספים
    'המשרד לפיתוח הפריפריה, הנגב והגליל': '65be68105867b500fd71e7d7', // כלכלה
    'משרד הנגב, הגליל והחוסן הלאומי': '65be68105867b500fd71e7d7', // כלכלה
    'משרד החינוך': '65be68105867b500fd71e7d5', // חינוך
    'משרד הכלכלה והתעשייה': '65be68105867b500fd71e7d7', // כלכלה
    'משרד המודיעין': '65be68105867b500fd71e7d3' // חוץ וביטחון
  };
  constructor() {
    super(MinistryModel);
  }

  getCategoryByMinistryName(ministryName: string): string {
    return this.ministerToCategoryMap[ministryName];
  }
}

export default new MinistryRepo();
