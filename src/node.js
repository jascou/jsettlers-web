var proto = require("../data_pb");
import {Edge} from "./edge.js";
import {Coord} from "./coord.js";

/** Combination of 3 hexagon locations (Coords) */
export class Node {
    constructor(coord1, coord2, coord3) { /* Coord */
        var hash = Node._getHash(coord1, coord2, coord3);
        if (this.constructor._cache.has(hash)) {
            // return cached instance and exit constructor
            return this.constructor._cache.get(hash);
        }
        this._coord1 = coord1;
        this._coord2 = coord2;
        this._coord3 = coord3;
        this.constructor._cache.set(hash, this);
        this._hash = hash;
    }
    get coord1() { return this._coord1; }
    get coord2() { return this._coord2; }
    get coord3() { return this._coord3; }
    /** String */
    get hash() { return this._hash; }
    /** <Edge>[3] */
    get edges() {
        if (this._edges === undefined) {
            this._edges = [
                new Edge(this._coord1, this._coord2),
                new Edge(this._coord1, this._coord3),
                new Edge(this._coord2, this._coord3),
            ]
        }
        return this._edges;
    }
    // By adding the hashcode numbers the order of coord1, 
    // coord2 and coord3 is not important
    // We divide by 3 to prevent overflow
    // TODO: unit test for collisions up to maps ~20x20 tiles
    /** String */
    static _getHash(c1, c2, c3) {
        return ((c1.hash.hashCode() / 3) >> 0) + 
            ((c2.hash.hashCode() / 3) >> 0) + 
            ((c3.hash.hashCode() / 3) >> 0);
    }
    get data() {
        var data = new proto.Node();
        data.setCoord1(this.coord1.data);
        data.setCoord2(this.coord2.data);
        data.setCoord3(this.coord3.data);
        return data;
    }
    static fromData(data) {
        const coord1 = Coord.fromData(data.getCoord1());
        const coord2 = Coord.fromData(data.getCoord2());
        const coord3 = Coord.fromData(data.getCoord3());
        return new Node(coord1, coord2, coord3);
    }
}
Node._cache = new Map();