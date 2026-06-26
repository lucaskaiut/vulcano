<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Notas Fiscais</title>
<style>body{font-family:sans-serif;font-size:12px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}th{background:#f5f5f5;font-weight:600}h1{font-size:18px;margin-bottom:16px}</style>
</head>
<body>
<h1>Relatório de Notas Fiscais</h1>
<table>
<thead><tr><th>Colaborador</th><th>Competência</th><th>Nº Nota</th><th>Valor</th><th>Emissão</th><th>Status</th></tr></thead>
<tbody>
@foreach($rows as $r)
<tr><td>{{$r->user->name}}</td><td>{{$r->competence}}</td><td>{{$r->invoice_number}}</td><td>R$ {{number_format((float)$r->amount,2,',','.')}}</td><td>{{$r->issue_date->format('d/m/Y')}}</td><td>{{$r->status}}</td></tr>
@endforeach
</tbody>
</table>
<p style="margin-top:20px;color:#999">Gerado em {{now()->format('d/m/Y H:i')}}</p>
</body>
</html>
