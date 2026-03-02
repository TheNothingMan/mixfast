<?php 
session_start();
if(isset($_GET['login'])) {
    $passwort = $_POST['passwort'];
    
    if (password_verify($passwort, password_hash("ChangeMe", PASSWORD_DEFAULT))) {
        $_SESSION['loggedin'] = "true";
		if(isset($_SESSION['origin_url'])){
			header("Location: ".$_SESSION['origin_url']);
		}else{
			header("Location: index.php");
		}
    } else {
        $errorMessage = "E-Mail oder Passwort war ungültig<br>";
    }
    
}
?>
<!DOCTYPE html> 
<html> 
<head>
  <title>Login</title>    
</head> 
<body style="text-align: center; margin: 40px;">
 
<?php 
if(isset($errorMessage)) {
    echo $errorMessage;
}
?>
 
<form action="?login=1" method="post">
 
Passwort:<br>
<input type="password" size="40"  maxlength="250" name="passwort"><br>
<input type="submit" value="OK" style="margin: 10px">
</form> 
</body>
</html>