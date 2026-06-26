<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Colaboradores</title>
<style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5;font-weight:600}h1{font-size:18px;margin-bottom:16px}</style>
</head>
<body>
<h1>Relatório de Colaboradores</h1>
<table>
<thead><tr><th>Nome</th><th>Cargo</th><th>E-mail</th><th>Remuneração</th><th>Contratação</th></tr></thead>
<tbody>
@foreach($rows as $r)
<tr><td>{{$r->name}}</td><td>{{$r->job_title}}</td><td>{{$r->email}}</td><td>R$ {{number_format((float)$r->salary,2,',','.')}}</td><td>{{$r->hired_at?->format('d/m/Y')}}</td></tr>
@endforeach
</tbody>
</table>
<p style="margin-top:20px;color:#999">Gerado em {{now()->format('d/m/Y H:i')}}</p>
</body>
</html>
