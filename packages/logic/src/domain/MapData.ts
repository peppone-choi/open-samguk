/**
 * 도시 초기 데이터 및 연결 정보
 */
export interface CityInitialData {
  id: number;
  name: string;
  level: string;
  pop: number;
  agri: number;
  comm: number;
  secu: number;
  def: number;
  wall: number;
  region: string;
  x: number;
  y: number;
  neighbors: string[];
}

export const MapData: CityInitialData[] = [
  { id: 1, name: '업', level: '특', pop: 6205, agri: 125, comm: 113, secu: 100, def: 117, wall: 122, region: '하북', x: 345, y: 130, neighbors: ['남피', '복양', '호관', '계교', '관도'] },
  { id: 2, name: '허창', level: '특', pop: 5876, agri: 121, comm: 124, secu: 100, def: 117, wall: 125, region: '중원', x: 330, y: 215, neighbors: ['완', '진류', '초', '호로', '사수', '관도'] },
  { id: 3, name: '낙양', level: '특', pop: 8357, agri: 117, comm: 120, secu: 100, def: 121, wall: 124, region: '중원', x: 275, y: 180, neighbors: ['호관', '호로', '사곡', '사수'] },
  { id: 4, name: '장안', level: '특', pop: 5923, agri: 116, comm: 123, secu: 100, def: 120, wall: 118, region: '서북', x: 145, y: 165, neighbors: ['안정', '함곡', '기산'] },
  { id: 5, name: '성도', level: '특', pop: 6525, agri: 123, comm: 125, secu: 100, def: 125, wall: 123, region: '서촉', x: 25, y: 290, neighbors: ['덕양', '강주', '면죽'] },
  { id: 6, name: '양양', level: '특', pop: 5837, agri: 120, comm: 126, secu: 100, def: 115, wall: 117, region: '초', x: 255, y: 290, neighbors: ['신야', '장판'] },
  { id: 7, name: '건업', level: '특', pop: 6386, agri: 116, comm: 123, secu: 100, def: 115, wall: 119, region: '오월', x: 505, y: 305, neighbors: ['오', '합비', '광릉'] },
  { id: 8, name: '북평', level: '대', pop: 4862, agri: 102, comm: 95, secu: 80, def: 103, wall: 99, region: '하북', x: 465, y: 65, neighbors: ['역경', '백랑'] },
  { id: 9, name: '남피', level: '대', pop: 5032, agri: 99, comm: 101, secu: 80, def: 101, wall: 105, region: '하북', x: 395, y: 95, neighbors: ['업', '평원', '역경'] },
  { id: 10, name: '완', level: '대', pop: 4724, agri: 103, comm: 100, secu: 80, def: 101, wall: 99, region: '중원', x: 270, y: 235, neighbors: ['허창', '여남', '신야', '호로'] },
  // ... 더 많은 도시는 필요할 때 추가
];

/**
 * 도시 이름으로 ID를 찾거나 그 반대를 수행하는 유틸리티
 */
export class MapUtil {
  static getCityIdByName(name: string): number | null {
    const city = MapData.find(c => c.name === name);
    return city ? city.id : null;
  }

  static getCityNameById(id: number): string | null {
    const city = MapData.find(c => c.id === id);
    return city ? city.name : null;
  }

  static areAdjacent(cityId1: number, cityId2: number): boolean {
    const city1 = MapData.find(c => c.id === cityId1);
    const city2 = MapData.find(c => c.id === cityId2);
    if (!city1 || !city2) return false;

    return city1.neighbors.includes(city2.name) || city2.neighbors.includes(city1.name);
  }
}
