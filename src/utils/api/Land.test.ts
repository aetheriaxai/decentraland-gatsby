import Land from './Land';


describe('utils/api/Land', () => {
  const cases = [
    [0, 0, '0'],
    [1, 0, '340282366920938463463374607431768211456'],
    [1, 1, '340282366920938463463374607431768211457'],
    [0, 1, '1'],
    [0, -1, '340282366920938463463374607431768211455'],
    [-1, 0, '115792089237316195423570985008687907852929702298719625575994209400481361428480'],
    [-1, -1, '115792089237316195423570985008687907853269984665640564039457584007913129639935'],
    [24, 24, '8166776806102523123120990578362437074968'],
    [24, -24, '8507059173023461586584365185794205286376'],
    [-24, -24, '115792089237316195423570985008687907845443490226458979379799968036982460776424'],
    [-24, 24, '115792089237316195423570985008687907845103207859538040916336593429550692565016'],
    [120, 120, '40833884030512615615604952891812185374840'],
    [120, -120, '41174166397433554079068327499243953586056'],
    [-120, -120, '115792089237316195423570985008687907812776383002048886887316005723532712476552'],
    [-120, 120, '115792089237316195423570985008687907812436100635127948423852631116100944265336'],
  ] as const

  for (const [x, y, id] of cases) {
    test(`.encodeParcelId(x: ${x}, y: ${y}) => "${id}"`, () => {
      expect(Land.get().encodeParcelId([x, y])).toBe(id)
    })
  }

  for (const [x, y, id] of cases) {
    test(`.decodeParcelId(id: "${id}") => [${x}, ${y}]`, () => {
      expect(Land.get().decodeParcelId(id)).toEqual([x, y])
    })
  }
})