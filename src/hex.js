var proto = require("../data_pb");
import {Observable} from "./generic/observable.js";
import {Chit} from "./chit.js";

export class Hex extends Observable {
    constructor(coord) {
        super();
        this.coord = coord; // a Coord1d, Coord2d or Coord3d
        this.chit = new Chit(proto.ChitType.NONEHEX);
        this.port = null;
        this.makeObservable(["chit", "port"]);
    }
    static fromType(type, coord) {
        var hexType = proto.HexType;
        switch (type) {
            case hexType.NONEHEX: return new NoneHex(coord);
            case hexType.DESERT: return new Desert(coord);
            case hexType.SEA: return new Sea(coord);
            case hexType.FOREST: return new Forest(coord);
            case hexType.RIVER: return new River(coord);
            case hexType.MOUNTAIN: return new Mountain(coord);
            case hexType.PASTURE: return new Pasture(coord);
            case hexType.WHEATFIELD: return new WheatField(coord);
            case hexType.HEXFROMBAG: return new HexFromBag(coord);
        }
    }
    static parse(hexExpression) {
        if (hexExpression.none() !== null) { return new NoneHex(); }
        if (hexExpression.sea() !== null) { return new Sea(); }
        if (hexExpression.desert() !== null) { return new Desert(); }
        if (hexExpression.pasture() !== null) { return new Pasture(); }
        if (hexExpression.river() !== null) { return new River(); }
        if (hexExpression.forest() !== null) { return new Forest(); }
        if (hexExpression.mountain() !== null) { return new Mountain(); }
        if (hexExpression.wheatField() !== null) { return new WheatField(); }
        return null;
    }
    get color() { return 0x0; }
    /** True when this hex can have a port on top of it */
    get canHavePort() { return false; }
    get canHaveChit() { return false; }
    get canHaveRobber() { return false; }
    get canBuildLandPieces() { return false; }
}
export class Desert extends Hex {
    constructor(coord) {
        super(coord);
    }
    get type() { return proto.HexType.DESERT; }
    get color() { return 0xcfa762; }
    get canHaveRobber() { return true; }
    get canBuildLandPieces() { return true; }
}
export class Sea extends Hex { 
    constructor(coord) {
        super(coord);
    }
    get type() { return proto.HexType.SEA; }
    get color() { return 0x1E90FF; }
    get canHavePort() { return true; }
    get canHaveChit() { return true; }
}
export class WheatField extends Hex { 
    constructor(coord) {
        super(coord);
    }
    get type() { return proto.HexType.WHEATFIELD; }
    get color() { return 0xFFD700; }
    get canHaveChit() { return true; }
    get canHaveRobber() { return true; }
    get resourceType() { return proto.ResourceType.WHEAT; }
    get canBuildLandPieces() { return true; }
}
export class Mountain extends Hex {
    constructor(coord) {
        super(coord);
    }
    get type() { return proto.HexType.MOUNTAIN; }
    get color() { return 0x8A2BE2; }
    get canHaveChit() { return true; }
    get canHaveRobber() { return true; }
    get resourceType() { return proto.ResourceType.ORE; }
    get canBuildLandPieces() { return true; }
 }
 export class River extends Hex { 
    constructor(coord) {
        super(coord);
    }
    get type() { return proto.HexType.RIVER; }
    get color() { return 0xFF3232; }
    get canHaveChit() { return true; }
    get canHaveRobber() { return true; }
    get resourceType() { return proto.ResourceType.BRICK; }
    get canBuildLandPieces() { return true; }
}
export class Forest extends Hex { 
    constructor(coord) {
        super(coord);
    }
    get type() { return proto.HexType.FOREST; }
    get color() { return 0x006400; }
    get canHaveChit() { return true; }
    get canHaveRobber() { return true; }
    get resourceType() { return proto.ResourceType.TIMBER; }
    get canBuildLandPieces() { return true; }
}
export class Pasture extends Hex {
    constructor(coord) {
        super(coord);
    }
    get type() { return proto.HexType.PASTURE; }
    get color() { return 0x00FF00; }
    get canHaveChit() { return true; }
    get canHaveRobber() { return true; }
    get resourceType() { return proto.ResourceType.SHEEP; }
    get canBuildLandPieces() { return true; }
}
export class NoneHex extends Hex {
    constructor(coord) {
        super(coord);
    }
    get type() { return proto.HexType.NONEHEX; }
    get color() { return 0xC0C0C0; }
}
export class HexFromBag extends Hex {
    constructor(coord) {
        super(coord);
    }
    get type() { return proto.HexType.HEXFROMBAG; }
    get color() { return 0x808080; }
    get canHaveChit() { return true; }
    get canHavePort() { return true; }
}