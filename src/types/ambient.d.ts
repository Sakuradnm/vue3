declare namespace AMap {
    class Map {
        constructor(container: string | HTMLElement, opts?: MapOptions)
        destroy(): void
        addControl(control: any): void
    }

    class Marker {
        constructor(options?: MarkerOptions)
        setMap(map: Map | null): void
        getPosition(): LngLat
        on(event: string, callback: Function): void
    }

    class InfoWindow {
        constructor(options?: InfoWindowOptions)
        open(map: Map, position: LngLat): void
    }

    class LngLat {
        constructor(lng: number, lat: number)
    }

    interface MapOptions {
        zoom?: number
        center?: LngLat | [number, number]
        viewMode?: '2D' | '3D'
    }

    interface MarkerOptions {
        position?: LngLat | [number, number]
        title?: string
        map?: Map
    }

    interface InfoWindowOptions {
        content?: string | HTMLElement
        offset?: Pixel
    }

    class Pixel {
        constructor(x: number, y: number)
    }

    // 添加其他需要使用的类声明
    namespace event {
        interface EventEmitter {
            addListener(event: string, handler: Function): void
        }
    }
}
