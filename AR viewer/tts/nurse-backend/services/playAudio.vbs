' playAudio.vbs - Simple VBScript to play audio files
' Usage: wscript playAudio.vbs "path\to\audio.mp3"

On Error Resume Next

' Get the audio file path from command line arguments
If WScript.Arguments.Count > 0 Then
    audioFile = WScript.Arguments(0)
    
    ' Create Windows Media Player object
    Set wmp = CreateObject("WMPlayer.OCX")
    
    ' Play the audio file
    Set media = wmp.newMedia(audioFile)
    wmp.currentPlaylist.appendItem(media)
    wmp.controls.play
    
    ' Wait for playback to finish
    Do While wmp.playState <> 1 ' 1 = Stopped
        WScript.Sleep(100)
    Loop
    
    ' Clean up
    Set media = Nothing
    Set wmp = Nothing
End If
