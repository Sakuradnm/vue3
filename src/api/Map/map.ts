interface MapConfig {
    key: string
    version: string
    securityJsCode?: string
}
interface ServiceCenter {
    name: string
    address: string
    phone: string
    hours: string
    services: string[]
    longitude: number
    latitude: number
}

class AMapService {
    private map: AMap.Map | null = null
    private markers: AMap.Marker[] = []
    private config: MapConfig

    constructor(config: MapConfig) {
        this.config = config
    }

    async initMap(container: HTMLElement): Promise<AMap.Map> {
        await this.loadScript()
        this.map = new AMap.Map(container, {
            zoom: 5,
            center: [116.397428, 39.90923],
            viewMode: '3D'
        })
        return this.map
    }

    private loadScript(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (window.AMap) return resolve()

            const script = document.createElement('script')
            script.src = `https://webapi.amap.com/maps?v=${this.config.version}&key=${this.config.key}`
            script.onload = () => resolve()
            script.onerror = reject
            document.head.appendChild(script)
        })
    }

    addServiceMarkers(centers: ServiceCenter[]): void {
        if (!this.map) return

        this.clearMarkers()

        centers.forEach(center => {
            const marker = new AMap.Marker({
                position: new AMap.LngLat(center.longitude, center.latitude),
                title: center.name,
                map: this.map!
            })

            const infoWindow = new AMap.InfoWindow({
                content: this.createInfoWindowContent(center),
                offset: new AMap.Pixel(0, -30)
            })

            marker.on('click', () => {
                infoWindow.open(this.map!, marker.getPosition()!)
            })

            this.markers.push(marker)
        })
    }

    private createInfoWindowContent(center: ServiceCenter): string {
        return `
    <div class="map-info-window">
      <h4>${center.name}</h4>
      <p>地址：${center.address}</p>
      <p>电话：${center.phone}</p>
      <p>营业时间：${center.hours}</p>
      <div class="service-tags">
        ${center.services.map((s: string) => `<span class="tag">${s}</span>`).join('')}
      </div>
    </div>
  `
    }

    clearMarkers(): void {
        this.markers.forEach(marker => marker.setMap(null))
        this.markers = []
    }

    destroyMap(): void {
        if (this.map) {
            this.map.destroy()
            this.map = null
        }
    }
}

export const mapConfig: MapConfig = {
    key: import.meta.env.VITE_AMAP_KEY,// 请替换为您的AMap密钥
    version: '2.0',
    securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE// 请替换为您的AMap安全密钥
}

export const mapService = new AMapService(mapConfig)
