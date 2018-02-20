var proto = require("../data_pb");
import {Node} from "./node.js";
import {Coord} from "./coord.js";

export class Edge {
    constructor(coord1, coord2) {
        var hash = Edge._getHash(coord1, coord2);
        if (Edge._cache.has(hash)) {
            return Edge._cache.get(hash);
        }
        this._coord1 = coord1;
        this._coord2 = coord2;
        this._hash = hash;
        Edge._cache.set(hash, this);
    }
    static fromPartIndex(coord1, partIndex) {
        let pi = 5 - partIndex; // reverse clock
        pi = pi === 5 ? 0 : pi + 1;
        const coord2 = coord1.neighbors[pi];
        return new Edge(coord1, coord2);
    }
    get coord1() { return this._coord1; }
    get coord2() { return this._coord2; }
    get node1() {
        if (this._nodes === undefined) {
            this._setNodes();
        }
        return this._node1;
    }
    get node2() {
        if (this._nodes === undefined) {
            this._setNodes();
        }
        return this._node2;
    }
    /** <Node>[2]
     * // TODO: needed? */
    get nodes() {
        if (this._nodes === undefined) {
            this._setNodes();
        }
        return this._nodes;
    }
    /** For flat, a value 0..240 indicating the rotation 
     * int in degrees 0-360 */
    get rotation() {
        var c1 = this._coord1;
        var c2 = this._coord2;
        if (c1.x === c2.x) {
            return 180;
        }
        if (c1.y === c2.y) {
            return 60;
        }
        if (c1.z === c2.z) {
            return 120;
        }
    }
    _setNodes() {
        this._nodes = [];
        // TODO: surely there must be a smarter & more efficient way then this
        for (var neighbor1 of this._coord1.neighbors) {
            for (var neighbor2 of this._coord2.neighbors) {
                if (neighbor1 === neighbor2) {
                    this._nodes.push(new Node(this._coord1, this._coord2, neighbor1));
                }
            }
        }
        this._node1 = this._nodes[0];
        this._node2 = this._nodes[1];
    }
    static _getHash(coord1, coord2) {
        return ((coord1.hash.hashCode() / 2) >> 0) + ((coord2.hash.hashCode() / 2) >> 0);
    }
    static fromData(data) {
        const coord1 = Coord.fromData(data.getCoord1());
        const coord2 = Coord.fromData(data.getCoord2());
        return new Edge(coord1, coord2);
    }
    get data() {
        const data = new proto.Edge();
        data.setCoord1(this.coord1.data);
        data.setCoord2(this.coord2.data);
        return data;
    }
}
Edge._cache = new Map();