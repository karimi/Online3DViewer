OV.ExporterStl = class extends OV.ExporterBase
{
	constructor ()
	{
		super ();
	}

    CanExport (format, extension)
    {
        return (format === OV.FileFormat.Text || format === OV.FileFormat.Binary) && extension === 'stl';
    }

	ExportContent (exporterModel, format, files, onFinish)
	{
		if (format === OV.FileFormat.Text) {
			this.ExportText (exporterModel, files);
		} else {
			this.ExportBinary (exporterModel, files);
		}
		onFinish ();
	}

	ExportText (exporterModel, files)
	{
		let stlFile = new OV.ExportedFile ('model.stl');
		files.push (stlFile);

		let stlWriter = new OV.TextWriter ();
		stlWriter.WriteLine ('solid Model');
		exporterModel.EnumerateTrianglesWithNormals ((v0, v1, v2, normal) => {
			stlWriter.WriteArrayLine (['facet', 'normal', normal.x, normal.y, normal.z]);
			stlWriter.Indent (1);
			stlWriter.WriteLine ('outer loop');
			stlWriter.Indent (1);
			stlWriter.WriteArrayLine (['vertex', v0.x, v0.y, v0.z]);
			stlWriter.WriteArrayLine (['vertex', v1.x, v1.y, v1.z]);
			stlWriter.WriteArrayLine (['vertex', v2.x, v2.y, v2.z]);
			stlWriter.Indent (-1);
			stlWriter.WriteLine ('endloop');
			stlWriter.Indent (-1);
			stlWriter.WriteLine ('endfacet');
		});
		stlWriter.WriteLine ('endsolid Model');

		stlFile.SetTextContent (stlWriter.GetText ());
	}

	ExportBinary (exporterModel, files)
	{
		let stlFile = new OV.ExportedFile ('model.stl');
		files.push (stlFile);

		let triangleCount = exporterModel.TriangleCount ();
		let headerSize = 80;
		let fullByteLength = headerSize + 4 + triangleCount * 50;
		let stlWriter = new OV.BinaryWriter (fullByteLength, true);

		for (let i = 0; i < headerSize; i++) {
			stlWriter.WriteUnsignedCharacter8 (0);
		}

		stlWriter.WriteUnsignedInteger32 (triangleCount);
		exporterModel.EnumerateTrianglesWithNormals ((v0, v1, v2, normal) => {
			stlWriter.WriteFloat32 (normal.x);
			stlWriter.WriteFloat32 (normal.y);
			stlWriter.WriteFloat32 (normal.z);

			stlWriter.WriteFloat32 (v0.x);
			stlWriter.WriteFloat32 (v0.y);
			stlWriter.WriteFloat32 (v0.z);

			stlWriter.WriteFloat32 (v1.x);
			stlWriter.WriteFloat32 (v1.y);
			stlWriter.WriteFloat32 (v1.z);

			stlWriter.WriteFloat32 (v2.x);
			stlWriter.WriteFloat32 (v2.y);
			stlWriter.WriteFloat32 (v2.z);

			stlWriter.WriteUnsignedInteger16 (0);
		});

		stlFile.SetBufferContent (stlWriter.GetBuffer ());
	}
};
