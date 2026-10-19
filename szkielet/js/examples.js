// Example projects: complete configurations built on top of the defaults.
import { defaultState, normalize } from './model.js';

const base = (fn) => { const s = normalize(defaultState()); fn(s); return normalize(s); };

export const EXAMPLES = [
  {
    id: 'wiata', name: 'Wiata 3,1 × 2,5 m (zbudowana)',
    note: 'Wiata zbudowana w 2026: rygle co 80 cm, okap 30 cm, 8 krokwi, 10 łat, 6 kotew.',
    make: () => base(() => {}),
  },
  {
    id: 'szopa', name: 'Szopa na narzędzia 2,0 × 1,5 m',
    note: 'Mała szopa: dach jednospadowy 10° opadający do tyłu, drzwi w wyższej ścianie od frontu, bez poszycia od środka.',
    make: () => base((s) => {
      s.dims = { L: 2000, W: 1500 };
      s.walls.h0 = 2100;
      s.roof = { ...s.roof, type: 'mono', pitch: 10, highSide: 'front', ovhEave: 250, ovhGable: 200, clear: [] };
      s.floor.sheetT = 22;
      s.openings = { front: [{ id: 'sd', type: 'door', U: 545, w: 910, h: 1850, sill: 0 }], back: [], left: [], right: [] };
      s.partitions = [];
    }),
  },
  {
    id: 'warsztat', name: 'Warsztat 4 × 4 m',
    note: 'Dach dwuspadowy 25°, brama 1,6 m, trzy okna, poszycie od środka, podłoga 2,0 kN/m², kotwy co 1,5 m.',
    make: () => base((s) => {
      s.dims = { L: 4000, W: 4000 };
      s.walls.h0 = 2400;
      s.walls.sheatheIn = true;
      s.roof = { ...s.roof, type: 'gable', pitch: 25, ovhEave: 300, ovhGable: 300, ties: true, clear: [] };
      s.floor.sheetT = 30;
      s.loads.floor = 2.0;
      s.base.anchorMax = 1500;
      s.base.maxSpan = 1500;
      s.openings = {
        front: [{ id: 'wb', type: 'door', U: 1200, w: 1600, h: 2100, sill: 0 }],
        back: [{ id: 'wo3', type: 'window', U: 1500, w: 1000, h: 800, sill: 1000 }],
        left: [{ id: 'wo1', type: 'window', U: 1477, w: 1000, h: 800, sill: 1000 }],
        right: [{ id: 'wo2', type: 'window', U: 1477, w: 1000, h: 800, sill: 1000 }],
      };
      s.partitions = [];
    }),
  },
  {
    id: 'dom70', name: 'Dom letniskowy 70 m² (konstrukcja)',
    note: 'Parterowy dom 10 × 7 m, dach dwuspadowy 30°: krokwie i ściągi 45×195, ścianki 30 mm pod ściągami na łącznikach przesuwnych (poddasze nieużytkowe), rama 150×150, szczyty dzielone na oczepie, salon z wejściem, dwa pokoje, kuchnia, łazienka, sypialnia. Ściany 95 mm to stan surowy domu letniskowego (dom całoroczny: ok. 200 mm izolacji, WT 2021). Koszt obejmuje tylko konstrukcję i płyty; dom na zgłoszenie i tak wymaga projektu budowlanego.',
    make: () => base((s) => {
      s.dims = { L: 10000, W: 7000 };
      s.walls.h0 = 2600;
      s.walls.sheathT = 15;
      s.walls.doubleFrom = 1000;
      s.roof = { ...s.roof, type: 'gable', pitch: 30, ovhEave: 400, ovhGable: 300, ties: true, rafterSec: 'f195', rafterMax: 600, splice: 'scab', clear: [] };
      s.floor.sheetT = 30;
      s.loads.floor = 2.0;
      s.base = { ...s.base, beamSec: 'b150', anchorMax: 1500, maxSpan: 1500 };
      const win = (id, U, w = 1200, h = 1200, sill = 900) => ({ id, type: 'window', U, w, h, sill });
      s.openings = {
        front: [win('f1', 1000), { id: 'fd', type: 'door', U: 4500, w: 1000, h: 2100, sill: 0 }, win('f2', 7600)],
        back: [win('b1', 1300), win('b2', 4700, 600, 600, 1500), win('b3', 7500)],
        left: [win('l1', 1500, 900)],
        right: [win('r1', 4600, 900)],
      };
      const door = (id, U) => ({ id, type: 'door', U, w: 900, h: 2050, sill: 0 });
      s.partitions = [
        { id: 'n1', orient: 'x', c: 3500, a: 95, b: 9905, h: 2570, sheathe: 'none', openings: [{ id: 'nd1', type: 'door', U: 3005, w: 800, h: 2050, sill: 0 }, door('nd2', 4205), door('nd3', 5905)] },
        { id: 'p1', orient: 'y', c: 3000, a: 95, b: 3452.5, h: 2570, sheathe: 'none', openings: [door('pd1', 1500)] },
        { id: 'p2', orient: 'y', c: 7000, a: 95, b: 3452.5, h: 2570, sheathe: 'none', openings: [door('pd2', 1500)] },
        { id: 'p3', orient: 'y', c: 4000, a: 3547.5, b: 6905, h: 2570, sheathe: 'none', openings: [] },
        { id: 'p4', orient: 'y', c: 5500, a: 3547.5, b: 6905, h: 2570, sheathe: 'none', openings: [] },
      ];
    }),
  },
];
