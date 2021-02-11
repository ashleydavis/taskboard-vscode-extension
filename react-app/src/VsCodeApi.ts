import { InjectableSingleton } from "@codecapers/fusion";

export interface IVSCodeApi {

    printMessage(): void;

}

export const IVSCodeApi_id = "IVSCodeApi";

@InjectableSingleton(IVSCodeApi_id)
export class VSCodeApi implements IVSCodeApi {

    printMessage(): void {
        // alert("Hello world!");
    }
}

// export class MockVSCodeApi implements IVSCodeApi {


//     printMessasge(): void {
//         alert("This is the mock!");
//     }
// }