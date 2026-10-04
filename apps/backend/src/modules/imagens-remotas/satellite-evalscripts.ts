export const RGB_SCRIPT = `//VERSION=3
function setup() {
  return {input: [{bands: ['B02','B03','B04','dataMask']}], output: {bands: 4}};
}
function evaluatePixel(s) { return [2.5*s.B04, 2.5*s.B03, 2.5*s.B02, s.dataMask]; }
`;

// Per-output masks preserve cloud statistics while excluding contaminated index samples.
export const STATS_SCRIPT = `//VERSION=3
function setup() {
  return {input: [{bands: ['B02','B04','B05','B08','SCL','dataMask']}], output: [
    {id:'ndvi',bands:1}, {id:'ndre',bands:1}, {id:'evi',bands:1},
    {id:'cloud',bands:1}, {id:'dataMask',bands:['ndvi','ndre','evi','cloud']}
  ]};
}
function evaluatePixel(s) {
  var dn = s.B08+s.B04, dr = s.B08+s.B05, de = s.B08+6*s.B04-7.5*s.B02+1;
  var clear = [0,1,3,7,8,9,10,11].indexOf(s.SCL) === -1 ? s.dataMask : 0;
  return {
    ndvi:[dn !== 0 ? (s.B08-s.B04)/dn : 0],
    ndre:[dr !== 0 ? (s.B08-s.B05)/dr : 0],
    evi:[Math.abs(de)>0.000001 ? 2.5*(s.B08-s.B04)/de : 0],
    cloud:[[8,9,10].indexOf(s.SCL) !== -1 ? 1 : 0],
    dataMask:[clear*(dn!==0),clear*(dr!==0),clear*(Math.abs(de)>0.000001),s.dataMask]
  };
}
`;
