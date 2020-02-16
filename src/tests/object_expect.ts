export function expectObjectEqual(object:any, expectObj:any): void {
    expect( JSON.parse(JSON.stringify(object)) )
        .toStrictEqual(JSON.parse(JSON.stringify(expectObj)));
}

