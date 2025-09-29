namespace ProjektLabor.Data
{
    public class UploadHandler
    {
        public string Upload(IFormFile file)
        {
            string extension = Path.GetExtension(file.FileName);
            string validExtension = ".pdf";

            if (extension != validExtension)
            {
                return $"Extension not valid ({string.Join(',',validExtension)})";
            }

            long size = file.Length;

            if (size > (5 * 1024 * 1024)) 
            {
                return "Max size is 5mb";
            }
            string filename = Guid.NewGuid().ToString() + extension;
            string path = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
            Directory.CreateDirectory(path);
            using FileStream fs = new FileStream(Path.Combine(path , filename), FileMode.Create);
            file.CopyTo(fs);

            return filename;

        }
    }
}
