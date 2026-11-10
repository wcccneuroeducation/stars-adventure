export const ROOM = { width: 960, height: 540, spawn: { x: 464, y: 336 } };
export const roomBounds = { x: 128, y: 96, width: 704, height: 352 };
export const bedroomSolids = [
  { x: 160, y: 128, width: 112, height: 128 }, // bed
  { x: 304, y: 176, width: 64, height: 64 }, // bedside table
  { x: 688, y: 112, width: 112, height: 96 }, // wardrobe
  { x: 144, y: 288, width: 80, height: 64 }, // dresser
  { x: 544, y: 192, width: 80, height: 48 } // desk
];
export const bedroomObjects = [
  { id: 'window', zone: { x: 416, y: 96, width: 128, height: 80 } },
  { id: 'wardrobe', zone: { x: 672, y: 208, width: 144, height: 64 } },
  { id: 'water', zone: { x: 288, y: 240, width: 96, height: 64 } },
  { id: 'hat', zone: { x: 224, y: 288, width: 64, height: 96 } },
  { id: 'backpack', zone: { x: 528, y: 240, width: 112, height: 64 } },
  { id: 'door', zone: { x: 672, y: 384, width: 128, height: 64 } }
];
// Right-hand approach to the existing desk; keeps the backpack's front zone usable.
export const medicineDesk={id:'medicineDesk',zone:{x:640,y:208,width:40,height:64}};

export function nearbyObject(objects, x, y, inventory) {
  return objects.find(object => {
    if (inventory.includes(object.id)) return false;
    const z = object.zone;
    return x >= z.x && x < z.x + z.width && y >= z.y && y < z.y + z.height;
  });
}
