class ArrayBufferArray implements ArrayBufferView {
	private bufferCache?: ArrayBuffer;
	private readonly length: number[];
	readonly byteLength: number;
	readonly byteOffset = 0;

	constructor (readonly array: ArrayBuffer[]) {
		this.length = array.map((buf) => buf.byteLength);
		this.byteLength = this.length.reduce((prev, next) => prev + next);
	}

	get buffer (): ArrayBuffer {
		if (this.bufferCache == null) {
			this.bufferCache = this.toArrayBuffer();
		}

		return this.bufferCache;
	}

	toArrayBuffer (): ArrayBuffer {
		const array = this.array.map((buf) => new Uint8Array(buf));
		const view = new Uint8Array(this.byteLength);
		let currentOffset = 0;

		for (const buf of array) {
			view.set(buf, currentOffset);
			currentOffset += buf.length;
		}

		return view.buffer;
	}

	toDataView (): DataView {
		return new DataView(this.toArrayBuffer());
	}

	toBlob (): Blob {
		return new Blob(this.array);
	}

	async toJSStream (
		stream: WritableStream<ArrayBuffer>,
		end = true,
	): Promise<void> {
		const writer = stream.getWriter();

		for (const buf of this.array) {
			await writer.write(buf);
		}

		if (end) await writer.close();
	}

	toNodeStream (stream: NodeJS.WritableStream, end = true): void {
		for (const buf of this.array) {
			stream.write(new Uint8Array(buf));
		}

		if (end) stream.end();
	}

	* toIterator (): Generator<ArrayBuffer> {
		for (const buf of this.array) {
			yield buf;
		}
	}
}

export { ArrayBufferArray };
