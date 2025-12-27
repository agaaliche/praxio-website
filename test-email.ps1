$outputFile = "c:\praxio\praxio-website\test-email-result.txt"
$body = @{email='antoine@praxio.net'} | ConvertTo-Json
try {
    $result = Invoke-RestMethod -Uri 'http://localhost:3000/api/admin/test-email' -Method POST -Body $body -ContentType 'application/json'
    "SUCCESS!" | Out-File $outputFile
    ($result | ConvertTo-Json -Depth 5) | Out-File $outputFile -Append
} catch {
    "ERROR: $($_.Exception.Message)" | Out-File $outputFile
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $reader.ReadToEnd() | Out-File $outputFile -Append
    }
}
